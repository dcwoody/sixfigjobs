// scripts/enrichCompaniesFromDB.js
// Wikipedia + Supabase enrichment (cleaned & hardened)

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars from .env/.env.local
dotenv.config({ path: '.env.local' });
dotenv.config(); 

const WIKI_USER_AGENT =
  process.env.WIKI_USER_AGENT ||
  'SixFigHiresEnricher/1.0 (contact: ops@sixfigjob.com)';

const DEFAULT_DELAY_MS = 1000;

class SupabaseWikipediaEnricher {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.searchUrl = 'https://en.wikipedia.org/w/api.php';
    this.delay = Number(process.env.ENRICH_DELAY_MS || DEFAULT_DELAY_MS);

    // --- Supabase (service key required for updates) ---
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔧 Supabase client initialized');
    console.log(`📍 Database URL: ${supabaseUrl}`);
  }

  // ---------- Utilities ----------
  async sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async fetchJson(url, opts = {}, { retries = 3, backoffMs = 800 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          ...opts,
          headers: {
            'User-Agent': WIKI_USER_AGENT,
            Accept: 'application/json',
            ...(opts.headers || {}),
          },
        });

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
          const wait = backoffMs * Math.pow(2, attempt);
          console.log(`   ⏳ Backing off ${wait}ms (attempt ${attempt + 1})`);
          await this.sleep(wait);
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          const wait = backoffMs * Math.pow(2, attempt);
          console.log(`   ⏳ Retry in ${wait}ms due to: ${err.message}`);
          await this.sleep(wait);
        }
      }
    }
    throw lastErr;
  }

  async fetchText(url, opts = {}, { retries = 3, backoffMs = 800 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          ...opts,
          headers: {
            'User-Agent': WIKI_USER_AGENT,
            ...(opts.headers || {}),
          },
        });

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
          const wait = backoffMs * Math.pow(2, attempt);
          console.log(`   ⏳ Backing off ${wait}ms (attempt ${attempt + 1})`);
          await this.sleep(wait);
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return await res.text();
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          const wait = backoffMs * Math.pow(2, attempt);
          console.log(`   ⏳ Retry in ${wait}ms due to: ${err.message}`);
          await this.sleep(wait);
        }
      }
    }
    throw lastErr;
  }

  // ---------- DB ----------
  async loadCompaniesFromDB() {
    console.log('📊 Loading companies from Supabase database...');
    // Optional: filter only records that need enrichment
    // .is('enrichment_status', null)
    // .or('company_logo.is.null,website.is.null,year_founded.is.null,ceo_name.is.null,headquarters.is.null,description.is.null,mission.is.null')
    const { data, error } = await this.supabase
      .from('company_db')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Supabase error: ${error.message}`);
    console.log(`✅ Loaded ${data.length} companies from database`);
    return data;
  }

  async updateCompanyInDB(companyId, updates) {
    try {
      const payload = {
        ...updates,
        enrichment_status: 'completed',
        enrichment_date: new Date().toISOString(),
        enrichment_fields_added: Object.keys(updates),
      };

      const { error } = await this.supabase
        .from('company_db')
        .update(payload)
        .eq('id', companyId);

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error(`❌ Error updating company ${companyId}:`, err.message);
      return false;
    }
  }

  // ---------- Wikipedia ----------
  async searchWikipedia(companyName) {
    try {
      const cleanName = companyName.trim();
      const core = this.extractCoreCompanyName(cleanName);

      const searchTerms = [
        `"${cleanName}"`,
        `"${core.coreName}"`,
        `${cleanName} company`,
        `${core.coreName} company`,
        `${cleanName} corporation`,
        `${core.coreName}`,
        `${cleanName} organization`,
        `${cleanName} association`,
      ];

      for (const term of searchTerms) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: term,
          srlimit: '15',
          origin: '*',
        });

        const data = await this.fetchJson(`${this.searchUrl}?${params}`);
        if (data.query?.search?.length > 0) {
          const best = this.findBestCompanyMatch(data.query.search, cleanName, core);
          if (best) {
            console.log(
              `   🎯 Confident match: "${best.title}" (${best.confidence})`
            );
            return {
              title: best.title,
              pageId: best.pageid,
              snippet: best.snippet.replace(/<[^>]*>/g, ''),
              confidence: best.confidence,
            };
          }
        }
        await this.sleep(200);
      }

      console.log(`   ❌ No confident Wikipedia match found`);
      return null;
    } catch (err) {
      console.error(`Wikipedia search error for ${companyName}:`, err.message);
      return null;
    }
  }

  extractCoreCompanyName(companyName) {
    const original = companyName.trim();
    let coreName = original;
    const patterns = [
      /\s*\([^)]+\)\s*$/g,
      /\s+(Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?|Limited|Co\.?|Company)$/i,
      /\s+(Systems|Technologies|Solutions|Services|Group|Associates)$/i,
    ];
    for (const p of patterns) coreName = coreName.replace(p, '').trim();
    return { original, coreName };
  }

  findBestCompanyMatch(results, companyName, coreNameExtraction) {
    const company = companyName.toLowerCase();
    const coreName = coreNameExtraction.coreName.toLowerCase();

    const companyDisambiguation = {
      adobe: ['Adobe Inc.', 'Adobe Systems'],
      amazon: ['Amazon (company)', 'Amazon.com'],
      'amazon web services': ['Amazon Web Services'],
      aws: ['Amazon Web Services'],
      apple: ['Apple Inc.'],
      microsoft: ['Microsoft'],
      google: ['Google', 'Alphabet Inc.'],
      meta: ['Meta Platforms'],
      facebook: ['Meta Platforms', 'Facebook'],
      oracle: ['Oracle Corporation'],
      ibm: ['IBM'],
      cisco: ['Cisco'],
      intel: ['Intel'],
      nvidia: ['Nvidia'],
      capgemini: ['Capgemini'],
      'tetra tech': ['Tetra Tech'],
    };

    const preferredTitles = companyDisambiguation[company] || companyDisambiguation[coreName];
    if (preferredTitles) {
      for (const preferred of preferredTitles) {
        const match = results.find((r) => r.title.toLowerCase() === preferred.toLowerCase());
        if (match) return { ...match, confidence: 'high-disambiguated' };
      }
    }

    const scored = results.map((r) => {
      const title = r.title.toLowerCase();
      const snippet = (r.snippet || '').toLowerCase();
      let score = 0;
      const reasons = [];

      const nameInTitle = title.includes(company) || title.includes(coreName);
      const businessTerms = [
        'is a company',
        'is a corporation',
        'multinational corporation',
        'technology company',
        'consulting firm',
        'software company',
        'founded',
        'headquarters',
        'ceo',
        'publicly traded',
        'fortune 500',
        'nasdaq',
        'nyse',
        'professional organization',
        'non-profit',
        'nonprofit',
      ];
      const businessHits = businessTerms.filter((t) => snippet.includes(t)).length;
      const hasBusinessContext = businessHits > 0;

      if (!nameInTitle && !hasBusinessContext) return { ...r, score: -100, reasons: ['no-relevance'] };

      if (nameInTitle) {
        score += 50;
        reasons.push('name-in-title');
      }
      if (hasBusinessContext) {
        score += businessHits * 15;
        reasons.push(`biz:${businessHits}`);
      }
      if (title === company || title === coreName) {
        score += 100;
        reasons.push('exact-title');
      }
      const variations = [
        `${company} (company)`,
        `${company} (organization)`,
        `${coreName} (company)`,
        `${coreName} (organization)`,
      ];
      if (variations.includes(title)) {
        score += 90;
        reasons.push('title-variation');
      }
      if (title.startsWith(company + ' ') || title.startsWith(coreName + ' ')) {
        score += 70;
        reasons.push('title-starts');
      }
      const suffixes = [
        ' inc.',
        ' llc',
        ' corp',
        ' corporation',
        ' ltd',
        ' limited',
        ' systems',
        ' technologies',
        ' solutions',
        ' consulting',
        ' services',
        ' group',
        ' association',
      ];
      if (suffixes.some((s) => title === company + s || title === coreName + s)) {
        score += 80;
        reasons.push('company-suffix');
      }

      const rejectTerms = [
        'nudity',
        'protein',
        'gene',
        'species',
        'mountain',
        'film',
        'song',
        'album',
        'band',
        'character',
        'mythology',
        'chemical',
        'virus',
        'bacteria',
      ];
      if (rejectTerms.some((t) => title.includes(t) || snippet.includes(t))) {
        return { ...r, score: -200, reasons: ['reject'] };
      }

      const industryBoosts = [
        'technology',
        'consulting',
        'software',
        'services',
        'solutions',
        'systems',
        'engineering',
        'defense',
        'government',
        'medical',
        'healthcare',
        'education',
        'research',
        'professional',
      ];
      const industryHits = industryBoosts.filter(
        (t) => title.includes(t) || snippet.includes(t)
      ).length;
      score += industryHits * 2;

      return { ...r, score, reasons, title, snippet };
    });

    const viable = scored.filter((r) => r.score > 40).sort((a, b) => b.score - a.score);
    if (viable.length === 0) return null;

    const top = viable[0];
    const confidence = top.score >= 90 ? 'high' : top.score >= 60 ? 'medium' : 'low';
    if (confidence === 'high' || confidence === 'medium') {
      console.log(
        `   🔍 Best match: "${top.title}" (score: ${top.score}, reasons: ${top.reasons.join(', ')})`
      );
      return { ...top, confidence };
    }
    return null;
  }

  async getPageSummary(title) {
    try {
      const encoded = encodeURIComponent(title);
      const url = `${this.baseUrl}/page/summary/${encoded}`;
      const data = await this.fetchJson(url);
      return {
        title: data.title,
        description: data.extract,
        thumbnail: data.thumbnail?.source,
        originalImage: data.originalimage?.source,
        pageUrl: data.content_urls?.desktop?.page,
      };
    } catch {
      return null;
    }
  }

  async getPageDetails(title) {
    try {
      const encoded = encodeURIComponent(title);
      const htmlContent = await this.fetchText(`https://en.wikipedia.org/wiki/${encoded}`);

      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts|pageimages|categories|info',
        titles: title,
        exintro: 'true',
        explaintext: 'true',
        piprop: 'original',
        inprop: 'url',
        origin: '*',
      });

      const data = await this.fetchJson(`${this.searchUrl}?${params}`);
      const pages = data.query?.pages;
      if (!pages) return { htmlContent };

      const page = Object.values(pages)[0];
      if (page.missing) return { htmlContent };

      return {
        extract: page.extract,
        fullurl: page.fullurl,
        categories: page.categories?.map((c) => c.title.replace('Category:', '')) || [],
        htmlContent,
      };
    } catch (err) {
      console.error('Error fetching page details:', err.message);
      return null;
    }
  }

  // ---------- Parsing ----------
  cleanHtmlText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  parseInfobox(htmlContent) {
    const infoboxData = {};
    try {
      const match = htmlContent?.match(
        /<table[^>]*class="[^"]*infobox[^"]*"[^>]*>(.*?)<\/table>/is
      );
      if (!match) {
        console.log('   ❌ No infobox found in HTML content');
        return {};
      }
      const infoboxHtml = match[1];
      console.log('   🔍 Found infobox, parsing structured data...');

      const img1 = infoboxHtml.match(
        /<[^>]*class="[^"]*infobox-image[^"]*"[^>]*>.*?<img[^>]*src="([^"]*(?:upload\.wikimedia\.org[^"]*\.(?:png|jpg|jpeg|svg)[^"]*))"/is
      );
      const img2 =
        img1 ||
        infoboxHtml.match(
          /<img[^>]*src="([^"]*(?:upload\.wikimedia\.org[^"]*\.(?:png|jpg|jpeg|svg)[^"]*))"/i
        );
      if (img2) {
        let logoUrl = img2[1];
        if (logoUrl.startsWith('//')) logoUrl = 'https:' + logoUrl;
        infoboxData.logo = logoUrl;
        console.log(`   🖼️  Found logo: ${logoUrl}`);
      }

      const urlClassMatch = infoboxHtml.match(
        /<[^>]*class="[^"]*url[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/is
      );
      if (urlClassMatch) {
        let websiteUrl = urlClassMatch[1];
        if (websiteUrl.startsWith('//')) websiteUrl = 'https:' + websiteUrl;
        if (!websiteUrl.startsWith('http') && !websiteUrl.includes('wikipedia')) {
          websiteUrl = 'https://' + websiteUrl;
        }
        if (!websiteUrl.includes('wikipedia')) {
          infoboxData.website = websiteUrl;
          console.log(`   🌐 Found website (url class): ${websiteUrl}`);
        }
      }

      const rowRegex =
        /<tr[^>]*>.*?<th[^>]*[^>]*>(.*?)<\/th>.*?<td[^>]*[^>]*>(.*?)<\/td>.*?<\/tr>/gis;
      let m;
      while ((m = rowRegex.exec(infoboxHtml)) !== null) {
        const key = this.cleanHtmlText(m[1]).toLowerCase().trim();
        const value = this.cleanHtmlText(m[2]).trim();
        if (!key || !value || value === '-') continue;

        switch (key) {
          case 'website': {
            if (!infoboxData.website) {
              const urlMatch = value.match(/https?:\/\/[^\s<>'"]+/i);
              if (urlMatch) {
                infoboxData.website = urlMatch[0];
                console.log(`   🌐 Found website (text): ${urlMatch[0]}`);
              } else if (value.includes('.') && !value.includes(' ')) {
                let url = value.replace(/^https?:\/\//, '');
                url = url.replace(/^www\./, 'www.');
                infoboxData.website = 'https://' + url;
                console.log(`   🌐 Found website (domain): ${infoboxData.website}`);
              }
            }
            break;
          }
          case 'founded':
          case 'formed':
          case 'established':
          case 'creation': {
            const y = value.match(/(\d{4})/);
            if (y) infoboxData.year_founded = parseInt(y[1], 10);
            break;
          }
          case 'headquarters':
          case 'hq':
          case 'location':
            infoboxData.headquarters = value;
            break;
          case 'industry':
          case 'industries':
            infoboxData.industry = value;
            break;
          case 'company type':
          case 'type': {
            const v = value.toLowerCase();
            if (v.includes('public')) infoboxData.type = 'Company - Public';
            else if (v.includes('private')) infoboxData.type = 'Company - Private';
            else if (v.includes('government') || v.includes('agency'))
              infoboxData.type = 'Government Agency';
            break;
          }
          case 'key people':
          case 'agency executive':
          case 'ceo':
          case 'chief executive officer':
          case 'director':
          case 'administrator':
          case 'secretary':
          case 'under secretary': {
            const nameMatch = value.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/);
            if (nameMatch) {
              infoboxData.ceo_name = nameMatch[1];
              const v = value.toLowerCase();
              if (key.includes('agency executive') || v.includes('under secretary'))
                infoboxData.ceo_title = 'Under Secretary';
              else if (key.includes('director') || v.includes('director'))
                infoboxData.ceo_title = 'Director';
              else if (key.includes('administrator') || v.includes('administrator'))
                infoboxData.ceo_title = 'Administrator';
              else if (key.includes('secretary') || v.includes('secretary'))
                infoboxData.ceo_title = 'Secretary';
              else if (v.includes('chairman') && v.includes('ceo'))
                infoboxData.ceo_title = 'Chairman & CEO';
              else if (v.includes('chairman')) infoboxData.ceo_title = 'Chairman';
              else infoboxData.ceo_title = 'CEO';
            }
            break;
          }
          case 'revenue':
          case 'annual revenue':
            infoboxData.revenue = value;
            break;
          case 'number of employees':
          case 'employees':
          case 'workforce': {
            const emp = value.match(/([\d,]+)/);
            if (emp) infoboxData.employees = emp[1];
            break;
          }
          case 'annual budget':
          case 'budget':
            if (!infoboxData.revenue) infoboxData.revenue = value;
            break;
        }
      }

      console.log(`   ✅ Parsed ${Object.keys(infoboxData).length} fields from infobox`);
      return infoboxData;
    } catch (err) {
      console.error('Error parsing infobox:', err.message);
      return {};
    }
  }

  extractDataForCompany(wikipediaData, originalCompany) {
    const extracted = {};
    console.log(`   🔍 Checking extraction for ${originalCompany.name}...`);
    console.log(
      `   📋 Current data: website=${originalCompany.website}, year_founded=${originalCompany.year_founded}, ceo_name="${originalCompany.ceo_name}"`
    );

    // Description
    if (wikipediaData.summary?.description) {
      if (!originalCompany.description) {
        extracted.description = wikipediaData.summary.description;
        console.log(`   ✅ Will add description: ${extracted.description.slice(0, 100)}...`);
      } else {
        console.log('   ⏭️  Skipping description (already exists)');
      }
    }

    // Logo
    const logoUrl = wikipediaData.summary?.originalImage || wikipediaData.summary?.thumbnail;
    if (logoUrl) {
      if (
        !originalCompany.company_logo ||
        originalCompany.company_logo.includes('clearbit.com') ||
        originalCompany.company_logo.includes('example.com')
      ) {
        extracted.company_logo = logoUrl;
        console.log(`   ✅ Will add logo: ${extracted.company_logo}`);
      } else {
        console.log(`   ⏭️  Skipping logo (already exists): ${originalCompany.company_logo}`);
      }
    }

    // Website
    if (!originalCompany.website) {
      const fullText = `${wikipediaData.summary?.description || ''} ${
        wikipediaData.details?.extract || ''
      }`;

      const companyWebsites = {
        'amazon web services': 'https://aws.amazon.com',
        aws: 'https://aws.amazon.com',
        'tetra tech': 'https://www.tetratech.com',
        capgemini: 'https://www.capgemini.com',
        'evidence action': 'https://www.evidenceaction.org',
        'customs and border protection': 'https://www.cbp.gov',
        cbp: 'https://www.cbp.gov',
        'bureau of industry and security': 'https://www.bis.doc.gov',
        bis: 'https://www.bis.doc.gov',
      };

      const companyLower = originalCompany.name.toLowerCase();
      if (companyWebsites[companyLower]) {
        extracted.website = companyWebsites[companyLower];
        console.log(`   ✅ Will add website (known): ${extracted.website}`);
      } else {
        const urlPatterns = [
          /website[:\s=]+([^\s<>,"'\]]+)/i,
          /official website[:\s=]+([^\s<>,"'\]]+)/i,
          /homepage[:\s=]+([^\s<>,"'\]]+)/i,
          /portal[:\s=]+([^\s<>,"'\]]+)/i,
          /(https?:\/\/(?:www\.)?[^\s<>,"']*\.(?:gov|com|org|edu|net)[^\s<>,"']*)/i,
          /\|\s*website\s*=\s*([^\s<>|"']+)/i,
          /\|\s*url\s*=\s*([^\s<>|"']+)/i,
        ];

        for (const pattern of urlPatterns) {
          const match = fullText.match(pattern);
          if (match) {
            let url = match[1];
            url = url.replace(/[.,;)\]]+$/, '');
            url = url.replace(/^\[+/, '');
            if (url.startsWith('www.') || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(url)) {
              url = 'https://' + url.replace(/^https?:\/\//, '');
            }
            if (url.startsWith('http') && !url.includes('wikipedia')) {
              extracted.website = url;
              console.log(`   ✅ Will add website (extracted): ${extracted.website}`);
              break;
            }
          }
        }
      }
    }

    // Year founded
    if (!originalCompany.year_founded || originalCompany.year_founded === 0) {
      const fullText = `${wikipediaData.summary?.description || ''} ${
        wikipediaData.details?.extract || ''
      }`;
      const patterns = [
        /formed[:\s]+(\d{4})/i,
        /founded[:\s]+(\d{4})/i,
        /established[:\s]+(\d{4})/i,
        /created[:\s]+(\d{4})/i,
        /since[:\s]+(\d{4})/i,
        /in[:\s]+(\d{4})[,\s]/i,
        /\|\s*formed\s*=\s*(\d{4})/i,
        /\|\s*founded\s*=\s*(\d{4})/i,
        /\|\s*established\s*=\s*(\d{4})/i,
      ];
      for (const p of patterns) {
        const m = fullText.match(p);
        if (m) {
          const year = parseInt(m[1], 10);
          if (year >= 1600 && year <= new Date().getFullYear()) {
            extracted.year_founded = year;
            console.log(`   ✅ Will add year_founded: ${year}`);
            break;
          }
        }
      }
    }

    // CEO
    if (
      !originalCompany.ceo_name ||
      originalCompany.ceo_name.length < 5 ||
      originalCompany.ceo_name.includes('the ')
    ) {
      const fullText = `${wikipediaData.summary?.description || ''} ${
        wikipediaData.details?.extract || ''
      }`;
      const ceoPatterns = [
        /agency executive[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /under secretary[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /director[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /led by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /headed by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /\|\s*agency_executive\s*=\s*([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /\|\s*director\s*=\s*([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
      ];
      for (const p of ceoPatterns) {
        const m = fullText.match(p);
        if (m) {
          const name = m[1].trim();
          if (name.length > 4 && name.includes(' ')) {
            extracted.ceo_name = name;
            extracted.ceo_title = 'Under Secretary'; // heuristic for gov bodies
            console.log(`   ✅ Will add CEO: ${name} (${extracted.ceo_title})`);
            break;
          }
        }
      }
    }

    // Headquarters
    if (
      !originalCompany.headquarters ||
      originalCompany.headquarters === 'Washington, District of Columbia' ||
      originalCompany.headquarters === 'Washington DC'
    ) {
      const fullText = `${wikipediaData.summary?.description || ''} ${
        wikipediaData.details?.extract || ''
      }`;
      const hqPatterns = [
        /headquarters[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /headquartered in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /based in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /located in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /\|\s*headquarters\s*=\s*([^|]+)/i,
      ];
      for (const p of hqPatterns) {
        const m = fullText.match(p);
        if (m) {
          let hq = m[1].trim();
          hq = hq.replace(/^(the\s+)?/i, '').replace(/[<>[\]]/g, '');
          if (hq.length > 5 && hq.length < 100) {
            extracted.headquarters = hq;
            console.log(`   ✅ Will add headquarters: ${hq}`);
            break;
          }
        }
      }
    }

    // Mission
    if (!originalCompany.mission) {
      const desc = extracted.description || wikipediaData.summary?.description || '';
      if (desc) {
        const missionKeywords = [
          'mission',
          'purpose',
          'goal',
          'objective',
          'aim',
          'vision',
          'responsible for',
        ];
        const sentences = desc.split('. ');
        for (const s of sentences) {
          if (missionKeywords.some((k) => s.toLowerCase().includes(k))) {
            let mission = s + (s.endsWith('.') ? '' : '.');
            mission = mission.replace(/^(The|Its|Their)\s+/i, '').trim();
            if (mission.length > 10 && mission.length < 300) {
              extracted.mission = mission;
              console.log(`   ✅ Will add mission: ${mission.slice(0, 100)}...`);
              break;
            }
          }
        }
      }
    }

    // Wikipedia URL
    if (wikipediaData.summary?.pageUrl) {
      extracted.wikipedia_url = wikipediaData.summary.pageUrl;
      console.log(`   ✅ Will add wikipedia_url: ${extracted.wikipedia_url}`);
    }

    return extracted;
  }

  // ---------- Enrichment ----------
  async enrichCompany(company) {
    console.log(`🔍 Enriching: ${company.name}`);
    try {
      const searchResult = await this.searchWikipedia(company.name);
      if (!searchResult) return { found: false, reason: 'No Wikipedia page found' };

      console.log(`   ✅ Found: ${searchResult.title}`);
      await this.sleep(this.delay);

      const summary = await this.getPageSummary(searchResult.title);
      await this.sleep(this.delay);

      const details = await this.getPageDetails(searchResult.title);
      await this.sleep(this.delay);

      const wikipediaData = { search: searchResult, summary, details };
      const extractedData =
        (details?.htmlContent && this.parseInfobox(details.htmlContent)) || {};

      // Merge infobox-derived fields on top of text-derived fields
      const merged = {
        ...this.extractDataForCompany(wikipediaData, company),
        ...extractedData,
      };

      console.log(`   📊 Extracted ${Object.keys(merged).length} fields`);
      return { found: true, wikipediaData, extractedData: merged };
    } catch (err) {
      console.error(`   ❌ Error enriching ${company.name}:`, err.message);
      return { found: false, error: err.message };
    }
  }

  async enrichDatabase(updateDB = false) {
    console.log('🚀 Starting Wikipedia enrichment from cleaned Supabase database...\n');
    const companies = await this.loadCompaniesFromDB();
    const results = [];

    console.log(`📋 Processing ${companies.length} companies\n`);

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`[${i + 1}/${companies.length}]`);

      const enrichmentResult = await this.enrichCompany(company);

      if (updateDB && enrichmentResult.found && Object.keys(enrichmentResult.extractedData).length) {
        console.log('   💾 Updating database...');
        const ok = await this.updateCompanyInDB(company.id, enrichmentResult.extractedData);
        enrichmentResult.databaseUpdated = ok;
        console.log(ok ? '   ✅ Database updated successfully' : '   ❌ Database update failed');
      }

      results.push({ original: company, enrichment: enrichmentResult });

      if (i < companies.length - 1) {
        console.log(`   ⏱️  Waiting ${this.delay}ms...\n`);
        await this.sleep(this.delay);
      }
    }

    return results;
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 WIKIPEDIA ENRICHMENT REPORT');
    console.log('='.repeat(60));

    const successful = results.filter((r) => r.enrichment.found);
    const failed = results.filter((r) => !r.enrichment.found);
    const dbUpdated = results.filter((r) => r.enrichment.databaseUpdated);

    console.log(`\n✅ Successfully enriched: ${successful.length}/${results.length} companies`);
    console.log(`❌ Failed to enrich: ${failed.length}/${results.length} companies`);
    if (dbUpdated.length > 0) {
      console.log(`💾 Database updated: ${dbUpdated.length}/${results.length} companies`);
    }

    if (successful.length > 0) {
      console.log('\n🎉 SUCCESSFUL ENRICHMENTS:');
      successful.forEach((result) => {
        const company = result.original;
        const extracted = result.enrichment.extractedData;
        console.log(`\n📍 ${company.name}:`);
        console.log(`   Wikipedia: ${result.enrichment.wikipediaData.summary?.pageUrl}`);
        console.log(`   Fields updated: ${Object.keys(extracted).join(', ')}`);
        if (result.enrichment.databaseUpdated !== undefined) {
          console.log(
            `   Database: ${result.enrichment.databaseUpdated ? '✅ Updated' : '❌ Failed'}`
          );
        }
      });
    }

    return { successful, failed, dbUpdated };
  }
}

// MAIN EXECUTION
async function main() {
  try {
    const enricher = new SupabaseWikipediaEnricher();

    const UPDATE_DATABASE = process.argv.includes('--update-db');
    console.log(`🔧 Mode: ${UPDATE_DATABASE ? 'UPDATE DATABASE' : 'PREVIEW ONLY'}\n`);

    const results = await enricher.enrichDatabase(UPDATE_DATABASE);
    const { dbUpdated } = enricher.generateReport(results);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENRICHMENT COMPLETE!');
    console.log('='.repeat(60));

    if (!UPDATE_DATABASE) {
      console.log('\n💡 This was a preview run. To update the database, use:');
      console.log('   npm run enrich-db -- --update-db');
    } else {
      console.log(`\n✅ Successfully updated ${dbUpdated.length} companies in your database!`);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SupabaseWikipediaEnricher };
