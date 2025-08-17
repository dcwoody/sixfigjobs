// scripts/enrichCompaniesFromDB.js
// Updated version for cleaned database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class SupabaseWikipediaEnricher {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.searchUrl = 'https://en.wikipedia.org/w/api.php';
    this.delay = 1000; // 1 second delay between requests
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔧 Supabase client initialized');
    console.log(`📍 Database URL: ${process.env.SUPABASE_URL}`);
  }

  // Load companies from Supabase database
  async loadCompaniesFromDB() {
    try {
      console.log('📊 Loading companies from Supabase database...');
      
      const { data, error } = await this.supabase
        .from('company_db')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log(`✅ Loaded ${data.length} companies from database`);
      return data;
    } catch (error) {
      console.error('❌ Error loading companies from database:', error.message);
      throw error;
    }
  }

  // Update company in Supabase database
  async updateCompanyInDB(companyId, updates) {
    try {
      const { error } = await this.supabase
        .from('company_db')
        .update({
          ...updates,
          enrichment_status: 'completed',
          enrichment_date: new Date().toISOString(),
          enrichment_fields_added: Object.keys(updates)
        })
        .eq('id', companyId);

      if (error) {
        throw new Error(`Database update error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error updating company ${companyId}:`, error.message);
      return false;
    }
  }

  async searchWikipedia(companyName) {
    try {
      // Clean the company name first - handle common variations
      let cleanName = companyName.trim();
      
      // Extract the core company name from common formats
      const coreNameExtraction = this.extractCoreCompanyName(cleanName);
      
      // Try multiple search strategies
      const searchTerms = [
        `"${cleanName}"`, // Exact phrase search first
        `"${coreNameExtraction.coreName}"`, // Core name without suffixes
        `${cleanName} company`,
        `${coreNameExtraction.coreName} company`,
        `${cleanName} corporation`,
        `${coreNameExtraction.coreName}`,
        `${cleanName} organization`,
        `${cleanName} association`
      ];

      for (const term of searchTerms) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: term,
          srlimit: '15',
          origin: '*'
        });

        const response = await fetch(`${this.searchUrl}?${params}`);
        const data = await response.json();

        if (data.query?.search?.length > 0) {
          const results = data.query.search;
          
          // Handle disambiguation and multiple company entities
          let bestMatch = this.findBestCompanyMatch(results, cleanName, coreNameExtraction);

          // Only return if we found a confident match
          if (bestMatch) {
            console.log(`   🎯 Confident match: "${bestMatch.title}" (${bestMatch.confidence})`);
            return {
              title: bestMatch.title,
              pageId: bestMatch.pageid,
              snippet: bestMatch.snippet.replace(/<[^>]*>/g, ''),
              confidence: bestMatch.confidence
            };
          }
        }
        
        // Wait between search attempts
        await this.sleep(200);
      }

      console.log(`   ❌ No confident Wikipedia match found`);
      return null;
    } catch (error) {
      console.error(`Wikipedia search error for ${companyName}:`, error.message);
      return null;
    }
  }

  extractCoreCompanyName(companyName) {
    const original = companyName.trim();
    let coreName = original;
    let removedSuffixes = [];
    
    // Remove common company suffixes and acronyms in parentheses
    const patterns = [
      /\s*\([^)]+\)\s*$/g, // Remove anything in parentheses at the end
      /\s+(Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?|Limited|Co\.?|Company)$/i,
      /\s+(Systems|Technologies|Solutions|Services|Group|Associates)$/i
    ];
    
    patterns.forEach(pattern => {
      const match = coreName.match(pattern);
      if (match) {
        removedSuffixes.push(match[0].trim());
        coreName = coreName.replace(pattern, '').trim();
      }
    });
    
    return {
      original,
      coreName,
      removedSuffixes
    };
  }

  findBestCompanyMatch(results, companyName, coreNameExtraction) {
    const company = companyName.toLowerCase();
    const coreName = coreNameExtraction.coreName.toLowerCase();
    
    // Define company-specific disambiguation rules
    const companyDisambiguation = {
      'adobe': ['Adobe Inc.', 'Adobe Systems'],
      'amazon': ['Amazon (company)', 'Amazon.com'],
      'amazon web services': ['Amazon Web Services'],
      'aws': ['Amazon Web Services'],
      'apple': ['Apple Inc.'],
      'microsoft': ['Microsoft'],
      'google': ['Google', 'Alphabet Inc.'],
      'meta': ['Meta Platforms'],
      'facebook': ['Meta Platforms', 'Facebook'],
      'oracle': ['Oracle Corporation'],
      'ibm': ['IBM'],
      'cisco': ['Cisco'],
      'intel': ['Intel'],
      'nvidia': ['Nvidia'],
      'capgemini': ['Capgemini'],
      'tetra tech': ['Tetra Tech']
    };

    // Check if we have specific disambiguation rules for this company
    const preferredTitles = companyDisambiguation[company] || companyDisambiguation[coreName];
    if (preferredTitles) {
      for (const preferredTitle of preferredTitles) {
        const match = results.find(result => 
          result.title.toLowerCase() === preferredTitle.toLowerCase()
        );
        if (match) {
          return { ...match, confidence: 'high-disambiguated' };
        }
      }
    }

    // Score and rank all potential matches
    const scoredResults = results.map(result => {
      const title = result.title.toLowerCase();
      const snippet = result.snippet.toLowerCase();
      let score = 0;
      let reasons = [];

      // STRICT REQUIREMENTS: Must have company name in title or very strong business context
      let hasCompanyNameInTitle = false;
      let hasStrongBusinessContext = false;

      // Check if title contains the company name (core requirement)
      if (title.includes(company) || title.includes(coreName)) {
        hasCompanyNameInTitle = true;
        score += 50;
        reasons.push('name-in-title');
      }

      // Check for strong business context in snippet
      const strongBusinessIndicators = [
        'is a company', 'is a corporation', 'is an american company',
        'multinational corporation', 'technology company', 'consulting firm',
        'software company', 'founded', 'headquarters', 'ceo', 'publicly traded',
        'fortune 500', 'nasdaq', 'nyse', 'provides services',
        'is an organization', 'professional organization', 'medical organization',
        'educational organization', 'non-profit', 'nonprofit'
      ];
      
      const strongBusinessMatches = strongBusinessIndicators.filter(indicator => 
        snippet.includes(indicator)
      ).length;
      
      if (strongBusinessMatches > 0) {
        hasStrongBusinessContext = true;
        score += strongBusinessMatches * 15;
        reasons.push(`strong-business:${strongBusinessMatches}`);
      }

      // REJECT IMMEDIATELY if neither condition is met
      if (!hasCompanyNameInTitle && !hasStrongBusinessContext) {
        return { ...result, score: -100, reasons: ['rejected-no-relevance'] };
      }

      // Additional scoring for exact matches
      if (title === company || title === coreName) {
        score += 100;
        reasons.push('exact-title');
      }

      // Very close matches (handle common variations)
      const titleVariations = [
        company + ' (company)',
        company + ' (organization)', 
        company + ' (association)',
        coreName + ' (company)',
        coreName + ' (organization)',
        coreName + ' (association)'
      ];
      
      if (titleVariations.some(variation => title === variation)) {
        score += 90;
        reasons.push('title-variation');
      }

      // Title starts with company name (strong indicator)
      if (title.startsWith(company + ' ') || title.startsWith(coreName + ' ')) {
        score += 70;
        reasons.push('title-starts');
      }

      // Common company suffixes/formats
      const companySuffixes = [
        ' inc.', ' inc', ' llc', ' corp', ' corporation',
        ' ltd', ' limited', ' systems', ' technologies', ' solutions',
        ' consulting', ' services', ' group', ' association', ' college',
        ' organization', ' society'
      ];
      
      for (const suffix of companySuffixes) {
        if (title === company + suffix || title === coreName + suffix) {
          score += 80;
          reasons.push('company-suffix');
          break;
        }
      }

      // STRONG PENALTIES for obviously wrong matches
      const rejectTerms = [
        'nudity', 'sexuality', 'pornography', 'adult content',
        'protein', 'gene', 'species', 'algorithm', 'theorem', 'equation',
        'mountain', 'river', 'city', 'county', 'movie', 'film', 'book', 
        'song', 'album', 'band', 'game', 'sport', 'tournament', 'league', 
        'character', 'fictional', 'mythology', 'legend', 'plant', 'animal',
        'chemical', 'element', 'compound', 'disease', 'virus', 'bacteria',
        'weapon', 'drug', 'medicine'
      ];
      
      const hasRejectTerms = rejectTerms.some(term => 
        title.includes(term) || snippet.includes(term)
      );
      
      if (hasRejectTerms) {
        return { ...result, score: -200, reasons: ['rejected-inappropriate-content'] };
      }

      // Small boost for relevant industry terms (but only if other criteria are met)
      if (hasCompanyNameInTitle || hasStrongBusinessContext) {
        const industryBoosts = [
          'technology', 'consulting', 'software', 'contractor', 'services',
          'solutions', 'systems', 'engineering', 'defense', 'government',
          'medical', 'healthcare', 'education', 'research', 'professional'
        ];
        
        const industryMatches = industryBoosts.filter(term => 
          title.includes(term) || snippet.includes(term)
        ).length;
        score += industryMatches * 2;
        if (industryMatches > 0) reasons.push(`industry-boost:${industryMatches}`);
      }

      return {
        ...result,
        score,
        reasons,
        title,
        snippet
      };
    });

    // Filter out rejected matches and sort by score
    const viableMatches = scoredResults
      .filter(result => result.score > 40) // Higher threshold after database cleanup
      .sort((a, b) => b.score - a.score);

    if (viableMatches.length === 0) {
      return null;
    }

    const topMatch = viableMatches[0];
    
    // Stricter confidence determination
    let confidence = 'rejected';
    if (topMatch.score >= 90) confidence = 'high';
    else if (topMatch.score >= 60) confidence = 'medium';
    
    // Log the reasoning for debugging
    console.log(`   🔍 Best match: "${topMatch.title}" (score: ${topMatch.score}, reasons: ${topMatch.reasons.join(', ')})`);
    
    // Only accept high and medium confidence matches
    if (confidence === 'high' || confidence === 'medium') {
      return { ...topMatch, confidence };
    }

    return null;
  }

  async getPageSummary(title) {
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await fetch(`${this.baseUrl}/page/summary/${encodedTitle}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        title: data.title,
        description: data.extract,
        thumbnail: data.thumbnail?.source,
        originalImage: data.originalimage?.source,
        pageUrl: data.content_urls?.desktop?.page
      };
    } catch (error) {
      console.error('Error fetching page summary:', error.message);
      return null;
    }
  }

  async getPageDetails(title) {
    try {
      // Get the full HTML content of the Wikipedia page
      const encodedTitle = encodeURIComponent(title);
      const htmlResponse = await fetch(`https://en.wikipedia.org/wiki/${encodedTitle}`);
      const htmlContent = await htmlResponse.text();
      
      // Also get the API data for additional info
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts|pageimages|categories|info',
        titles: title,
        exintro: 'true',
        explaintext: 'true',
        piprop: 'original',
        inprop: 'url',
        origin: '*'
      });

      const response = await fetch(`${this.searchUrl}?${params}`);
      const data = await response.json();
      
      const pages = data.query?.pages;
      if (!pages) return { htmlContent };

      const page = Object.values(pages)[0];
      if (page.missing) return { htmlContent };

      return {
        extract: page.extract,
        fullurl: page.fullurl,
        categories: page.categories?.map(cat => cat.title.replace('Category:', '')) || [],
        htmlContent: htmlContent
      };
    } catch (error) {
      console.error('Error fetching page details:', error.message);
      return null;
    }
  }

  // Parse Wikipedia infobox data
  parseInfobox(htmlContent) {
    const infoboxData = {};
    
    try {
      // Extract the infobox table
      const infoboxMatch = htmlContent.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>(.*?)<\/table>/is);
      if (!infoboxMatch) {
        console.log(`   ❌ No infobox found in HTML content`);
        return {};
      }

      const infoboxHtml = infoboxMatch[1];
      console.log(`   🔍 Found infobox, parsing structured data...`);

      // Extract logo/seal image with enhanced patterns
      // Look for images in infobox-image class first (government seals)
      const infoboxImageMatch = infoboxHtml.match(/<[^>]*class="[^"]*infobox-image[^"]*"[^>]*>.*?<img[^>]*src="([^"]*(?:upload\.wikimedia\.org[^"]*\.(?:png|jpg|jpeg|svg)[^"]*))"/is);
      if (infoboxImageMatch) {
        let logoUrl = infoboxImageMatch[1];
        if (logoUrl.startsWith('//')) {
          logoUrl = 'https:' + logoUrl;
        }
        infoboxData.logo = logoUrl;
        console.log(`   🖼️  Found logo (infobox-image): ${logoUrl}`);
      } else {
        // Fallback to any image with .png, .jpg, .jpeg, or .svg
        const logoMatch = infoboxHtml.match(/<img[^>]*src="([^"]*(?:upload\.wikimedia\.org[^"]*\.(?:png|jpg|jpeg|svg)[^"]*))"/i);
        if (logoMatch) {
          let logoUrl = logoMatch[1];
          if (logoUrl.startsWith('//')) {
            logoUrl = 'https:' + logoUrl;
          }
          infoboxData.logo = logoUrl;
          console.log(`   🖼️  Found logo (fallback): ${logoUrl}`);
        }
      }

      // Extract website URL from class="url" elements
      const urlClassMatch = infoboxHtml.match(/<[^>]*class="[^"]*url[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/is);
      if (urlClassMatch) {
        let websiteUrl = urlClassMatch[1];
        // Clean up the URL
        if (websiteUrl.startsWith('//')) {
          websiteUrl = 'https:' + websiteUrl;
        }
        if (!websiteUrl.startsWith('http') && !websiteUrl.includes('wikipedia')) {
          websiteUrl = 'https://' + websiteUrl;
        }
        if (!websiteUrl.includes('wikipedia')) {
          infoboxData.website = websiteUrl;
          console.log(`   🌐 Found website (url class): ${websiteUrl}`);
        }
      }

      // Extract key-value pairs from infobox rows
      const rowRegex = /<tr[^>]*>.*?<th[^>]*[^>]*>(.*?)<\/th>.*?<td[^>]*[^>]*>(.*?)<\/td>.*?<\/tr>/gis;
      let match;

      while ((match = rowRegex.exec(infoboxHtml)) !== null) {
        const key = this.cleanHtmlText(match[1]).toLowerCase().trim();
        const value = this.cleanHtmlText(match[2]).trim();

        if (key && value && value !== '-' && value.length > 0) {
          console.log(`   📋 Infobox: ${key} = ${value}`);

          // Map infobox fields to our database fields
          switch (key) {
            case 'website':
              // Also look for website in the value text
              if (!infoboxData.website) {
                const urlMatch = value.match(/https?:\/\/[^\s<>'"]+/i);
                if (urlMatch) {
                  infoboxData.website = urlMatch[0];
                  console.log(`   🌐 Found website (text): ${urlMatch[0]}`);
                } else if (value.includes('.') && !value.includes(' ')) {
                  // Looks like a domain without http
                  infoboxData.website = 'https://' + value.replace(/^www\./, 'www.');
                  console.log(`   🌐 Found website (domain): ${infoboxData.website}`);
                }
              }
              break;

            case 'founded':
            case 'formed':
            case 'established':
            case 'creation':
              const yearMatch = value.match(/(\d{4})/);
              if (yearMatch) {
                infoboxData.year_founded = parseInt(yearMatch[1]);
              }
              break;

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
            case 'type':
              if (value.toLowerCase().includes('public')) {
                infoboxData.type = 'Company - Public';
              } else if (value.toLowerCase().includes('private')) {
                infoboxData.type = 'Company - Private';
              } else if (value.toLowerCase().includes('government') || value.toLowerCase().includes('agency')) {
                infoboxData.type = 'Government Agency';
              }
              break;

            case 'key people':
            case 'agency executive':
            case 'ceo':
            case 'chief executive officer':
            case 'director':
            case 'administrator':
            case 'secretary':
            case 'under secretary':
              // Extract name and title
              const nameMatch = value.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/);
              if (nameMatch) {
                infoboxData.ceo_name = nameMatch[1];
                
                // Determine title based on the field name and content
                if (key.includes('agency executive') || value.toLowerCase().includes('under secretary')) {
                  infoboxData.ceo_title = 'Under Secretary';
                } else if (key.includes('director') || value.toLowerCase().includes('director')) {
                  infoboxData.ceo_title = 'Director';
                } else if (key.includes('administrator') || value.toLowerCase().includes('administrator')) {
                  infoboxData.ceo_title = 'Administrator';
                } else if (key.includes('secretary') || value.toLowerCase().includes('secretary')) {
                  infoboxData.ceo_title = 'Secretary';
                } else if (value.toLowerCase().includes('chairman') && value.toLowerCase().includes('ceo')) {
                  infoboxData.ceo_title = 'Chairman & CEO';
                } else if (value.toLowerCase().includes('chairman')) {
                  infoboxData.ceo_title = 'Chairman';
                } else {
                  infoboxData.ceo_title = 'CEO';
                }
              }
              break;

            case 'revenue':
            case 'annual revenue':
              infoboxData.revenue = value;
              break;

            case 'number of employees':
            case 'employees':
            case 'workforce':
              const empMatch = value.match(/([\d,]+)/);
              if (empMatch) {
                infoboxData.employees = empMatch[1];
              }
              break;

            case 'annual budget':
            case 'budget':
              if (!infoboxData.revenue) { // Use budget as revenue for government agencies
                infoboxData.revenue = value;
              }
              break;
          }
        }
      }

      console.log(`   ✅ Parsed ${Object.keys(infoboxData).length} fields from infobox`);
      return infoboxData;

    } catch (error) {
      console.error('Error parsing infobox:', error.message);
      return {};
    }
  }

  // Clean HTML text and extract plain text
  cleanHtmlText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractDataForCompany(wikipediaData, originalCompany) {
    const extracted = {};

    console.log(`   🔍 Checking extraction for ${originalCompany.name}...`);
    console.log(`   📋 Current data: website=${originalCompany.website}, year_founded=${originalCompany.year_founded}, ceo_name="${originalCompany.ceo_name}"`);

    // Description - Now handles proper NULL values from cleaned database
    if (wikipediaData.summary?.description) {
      if (originalCompany.description === null || originalCompany.description === '') {
        extracted.description = wikipediaData.summary.description;
        console.log(`   ✅ Will add description: ${extracted.description.substring(0, 100)}...`);
      } else {
        console.log(`   ⏭️  Skipping description (already exists): ${originalCompany.description.substring(0, 50)}...`);
      }
    } else {
      console.log(`   ❌ No description found in Wikipedia content`);
    }

    // Company Logo - Replace NULL or Clearbit logos
    const logoUrl = wikipediaData.summary?.originalImage || wikipediaData.summary?.thumbnail;
    if (logoUrl) {
      if (originalCompany.company_logo === null || 
         originalCompany.company_logo === '' ||
         originalCompany.company_logo?.includes('clearbit.com') ||
         originalCompany.company_logo?.includes('example.com')) {
        extracted.company_logo = logoUrl;
        console.log(`   ✅ Will add logo: ${extracted.company_logo}`);
      } else {
        console.log(`   ⏭️  Skipping logo (already exists): ${originalCompany.company_logo}`);
      }
    } else {
      console.log(`   ❌ No logo found in Wikipedia content`);
    }

    // Website URL - Handle NULL values and extract from Wikipedia
    console.log(`   🌐 Checking website: current="${originalCompany.website}" (type: ${typeof originalCompany.website})`);
    if (originalCompany.website === null || originalCompany.website === '') {
      
      const description = wikipediaData.summary?.description || '';
      const extract = wikipediaData.details?.extract || '';
      const fullText = description + ' ' + extract;
      
      console.log(`   🔍 Searching for website in Wikipedia content...`);
      console.log(`   📝 Sample content: ${fullText.substring(0, 200)}...`);
      
      // Company-specific website patterns
      const companyWebsites = {
        'amazon web services': 'https://aws.amazon.com',
        'aws': 'https://aws.amazon.com',
        'tetra tech': 'https://www.tetratech.com',
        'capgemini': 'https://www.capgemini.com',
        'evidence action': 'https://www.evidenceaction.org',
        'customs and border protection': 'https://www.cbp.gov',
        'cbp': 'https://www.cbp.gov',
        'bureau of industry and security': 'https://www.bis.doc.gov',
        'bis': 'https://www.bis.doc.gov'
      };
      
      const companyLower = originalCompany.name.toLowerCase();
      if (companyWebsites[companyLower]) {
        extracted.website = companyWebsites[companyLower];
        console.log(`   ✅ Will add website (known): ${extracted.website}`);
      } else {
        // Look for official website patterns in Wikipedia content
        const urlPatterns = [
          /website[:\s=]+([^\s<>,"'\]]+)/i,
          /official website[:\s=]+([^\s<>,"'\]]+)/i,
          /homepage[:\s=]+([^\s<>,"'\]]+)/i,
          /portal[:\s=]+([^\s<>,"'\]]+)/i,
          /(https?:\/\/(?:www\.)?[^\s<>,"']*\.(?:gov|com|org|edu|net)[^\s<>,"']*)/i,
          /\|\s*website\s*=\s*([^\s<>|"']+)/i, // Wikipedia infobox format
          /\|\s*url\s*=\s*([^\s<>|"']+)/i
        ];
        
        for (const pattern of urlPatterns) {
          const match = fullText.match(pattern);
          if (match) {
            let url = match[1];
            // Clean up the URL
            url = url.replace(/[.,;)\]]+$/, ''); // Remove trailing punctuation
            url = url.replace(/^\[+/, ''); // Remove leading brackets
            
            // Add https if missing
            if (url.startsWith('www.') || url.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
              url = 'https://' + url;
            }
            
            if (url.startsWith('http') && !url.includes('wikipedia')) {
              extracted.website = url;
              console.log(`   ✅ Will add website (extracted): ${extracted.website}`);
              break;
            }
          }
        }
        
        if (!extracted.website) {
          console.log(`   ❌ No website URL found in Wikipedia content`);
        }
      }
    } else {
      console.log(`   ⏭️  Skipping website (already exists): ${originalCompany.website}`);
    }

    // Year Founded - Handle INTEGER type from cleaned database
    console.log(`   📅 Checking year_founded: current=${originalCompany.year_founded} (type: ${typeof originalCompany.year_founded})`);
    if (originalCompany.year_founded === null || originalCompany.year_founded === 0) {
      const description = wikipediaData.summary?.description || '';
      const extract = wikipediaData.details?.extract || '';
      const fullText = description + ' ' + extract;
      
      console.log(`   🔍 Searching for founding year in Wikipedia content...`);
      
      const foundedPatterns = [
        /formed[:\s]+(\d{4})/i,
        /founded[:\s]+(\d{4})/i,
        /established[:\s]+(\d{4})/i,
        /created[:\s]+(\d{4})/i,
        /since[:\s]+(\d{4})/i,
        /in[:\s]+(\d{4})[,\s]/i,
        /\|\s*formed\s*=\s*(\d{4})/i, // Wikipedia infobox format
        /\|\s*founded\s*=\s*(\d{4})/i,
        /\|\s*established\s*=\s*(\d{4})/i
      ];
      
      for (const pattern of foundedPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          const year = parseInt(match[1]);
          console.log(`   🎯 Found potential year: ${year}`);
          if (year >= 1600 && year <= new Date().getFullYear()) {
            extracted.year_founded = year;
            console.log(`   ✅ Will add year_founded: ${extracted.year_founded}`);
            break;
          }
        }
      }
      
      if (!extracted.year_founded) {
        console.log(`   ❌ No founding year found in Wikipedia content`);
      }
    } else {
      console.log(`   ⏭️  Skipping year_founded (already exists): ${originalCompany.year_founded}`);
    }

    // CEO Name - Fix truncated or incorrect names
    console.log(`   👤 Checking CEO: current="${originalCompany.ceo_name}" (type: ${typeof originalCompany.ceo_name})`);
    if (originalCompany.ceo_name === null || 
        originalCompany.ceo_name === '' ||
        originalCompany.ceo_name?.length < 5 || // Fix truncated names like "the Under"
        originalCompany.ceo_name?.includes('the ')) {
      
      const description = wikipediaData.summary?.description || '';
      const extract = wikipediaData.details?.extract || '';
      const fullText = description + ' ' + extract;
      
      console.log(`   🔍 Searching for CEO in Wikipedia content...`);
      
      const ceoPatterns = [
        /agency executive[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /under secretary[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /director[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /led by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /headed by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /\|\s*agency_executive\s*=\s*([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i,
        /\|\s*director\s*=\s*([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*)/i
      ];
      
      for (const pattern of ceoPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          const name = match[1].trim();
          console.log(`   🎯 Found potential CEO: "${name}"`);
          if (name.length > 4 && name.includes(' ')) {
            extracted.ceo_name = name;
            extracted.ceo_title = 'Under Secretary'; // More appropriate for government
            console.log(`   ✅ Will add CEO: ${extracted.ceo_name} (${extracted.ceo_title})`);
            break;
          }
        }
      }
      
      if (!extracted.ceo_name) {
        console.log(`   ❌ No CEO name found in Wikipedia content`);
      }
    } else {
      console.log(`   ⏭️  Skipping CEO (already exists): ${originalCompany.ceo_name}`);
    }

    // Headquarters - Improve existing headquarters if it's too generic
    console.log(`   🏢 Checking headquarters: current="${originalCompany.headquarters}"`);
    if (originalCompany.headquarters === null || 
        originalCompany.headquarters === '' ||
        originalCompany.headquarters === 'Washington, District of Columbia' ||
        originalCompany.headquarters === 'Washington DC') {
      
      const description = wikipediaData.summary?.description || '';
      const extract = wikipediaData.details?.extract || '';
      const fullText = description + ' ' + extract;
      
      console.log(`   🔍 Searching for headquarters in Wikipedia content...`);
      
      const hqPatterns = [
        /headquarters[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /headquartered in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /based in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /located in[:\s]+([^,.]+(?:,\s*[^,.]+)*)/i,
        /\|\s*headquarters\s*=\s*([^|]+)/i
      ];
      
      for (const pattern of hqPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          let hq = match[1].trim();
          hq = hq.replace(/^(the\s+)?/i, '');
          hq = hq.replace(/[<>[\]]/g, ''); // Remove wiki markup
          console.log(`   🎯 Found potential headquarters: "${hq}"`);
          if (hq.length > 5 && hq.length < 100) {
            extracted.headquarters = hq;
            console.log(`   ✅ Will add headquarters: ${extracted.headquarters}`);
            break;
          }
        }
      }
      
      if (!extracted.headquarters) {
        console.log(`   ❌ No headquarters found in Wikipedia content`);
      }
    } else {
      console.log(`   ⏭️  Skipping headquarters (already exists): ${originalCompany.headquarters}`);
    }

    // Mission - Handle TEXT type from cleaned database
    if (originalCompany.mission === null || originalCompany.mission === '') {
      const desc = extracted.description || wikipediaData.summary?.description || '';
      if (desc) {
        const missionKeywords = ['mission', 'purpose', 'goal', 'objective', 'aim', 'vision', 'responsible for'];
        const sentences = desc.split('. ');
        
        for (const sentence of sentences) {
          if (missionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
            let mission = sentence + (sentence.endsWith('.') ? '' : '.');
            mission = mission.replace(/^(The|Its|Their)\s+/i, '').trim();
            if (mission.length > 10 && mission.length < 300) {
              extracted.mission = mission;
              console.log(`   ✅ Will add mission: ${extracted.mission.substring(0, 100)}...`);
              break;
            }
          }
        }
      }
      
      if (!extracted.mission) {
        console.log(`   ❌ No mission statement found in description`);
      }
    } else {
      console.log(`   ⏭️  Skipping mission (already exists): ${originalCompany.mission}`);
    }

    // Add Wikipedia URL as reference
    if (wikipediaData.summary?.pageUrl) {
      extracted.wikipedia_url = wikipediaData.summary.pageUrl;
      console.log(`   ✅ Will add wikipedia_url: ${extracted.wikipedia_url}`);
    }

    console.log(`   📊 Total extractable fields: ${Object.keys(extracted).length}`);
    if (Object.keys(extracted).length > 0) {
      console.log(`   🎯 Fields to be added: ${Object.keys(extracted).join(', ')}`);
    }
    return extracted;
  }

  async enrichCompany(company) {
    console.log(`🔍 Enriching: ${company.name}`);
    
    try {
      // Search for Wikipedia page
      const searchResult = await this.searchWikipedia(company.name);
      if (!searchResult) {
        console.log(`   ❌ No Wikipedia page found`);
        return { found: false, reason: 'No Wikipedia page found' };
      }

      console.log(`   ✅ Found: ${searchResult.title}`);
      await this.sleep(this.delay);

      // Get page summary
      const summary = await this.getPageSummary(searchResult.title);
      await this.sleep(this.delay);

      // Get page details with HTML content for infobox parsing
      const details = await this.getPageDetails(searchResult.title);
      await this.sleep(this.delay);

      const wikipediaData = {
        search: searchResult,
        summary: summary,
        details: details
      };

      const extractedData = this.extractDataForCompany(wikipediaData, company);

      console.log(`   📊 Extracted ${Object.keys(extractedData).length} fields`);

      return {
        found: true,
        wikipediaData: wikipediaData,
        extractedData: extractedData
      };

    } catch (error) {
      console.error(`   ❌ Error enriching ${company.name}:`, error.message);
      return { found: false, error: error.message };
    }
  }

  async enrichCompany(company) {
    console.log(`🔍 Enriching: ${company.name}`);
    
    try {
      // Search for Wikipedia page
      const searchResult = await this.searchWikipedia(company.name);
      if (!searchResult) {
        console.log(`   ❌ No Wikipedia page found`);
        return { found: false, reason: 'No Wikipedia page found' };
      }

      console.log(`   ✅ Found: ${searchResult.title}`);
      await this.sleep(this.delay);

      // Get page summary
      const summary = await this.getPageSummary(searchResult.title);
      await this.sleep(this.delay);

      // Get page details
      const details = await this.getPageDetails(searchResult.title);
      await this.sleep(this.delay);

      const wikipediaData = {
        search: searchResult,
        summary: summary,
        details: details
      };

      const extractedData = this.extractDataForCompany(wikipediaData, company);

      console.log(`   📊 Extracted ${Object.keys(extractedData).length} fields`);

      return {
        found: true,
        wikipediaData: wikipediaData,
        extractedData: extractedData
      };

    } catch (error) {
      console.error(`   ❌ Error enriching ${company.name}:`, error.message);
      return { found: false, error: error.message };
    }
  }

  async enrichDatabase(updateDB = false) {
    console.log('🚀 Starting Wikipedia enrichment from cleaned Supabase database...\n');

    // Load companies from database
    const companies = await this.loadCompaniesFromDB();
    const results = [];

    console.log(`📋 Processing ${companies.length} companies\n`);

    // Process each company
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`[${i + 1}/${companies.length}]`);
      
      const enrichmentResult = await this.enrichCompany(company);
      
      // Update database immediately if requested and enrichment was successful
      if (updateDB && enrichmentResult.found && Object.keys(enrichmentResult.extractedData).length > 0) {
        console.log(`   💾 Updating database...`);
        const updateSuccess = await this.updateCompanyInDB(company.id, enrichmentResult.extractedData);
        enrichmentResult.databaseUpdated = updateSuccess;
        
        if (updateSuccess) {
          console.log(`   ✅ Database updated successfully`);
        } else {
          console.log(`   ❌ Database update failed`);
        }
      }
      
      results.push({
        original: company,
        enrichment: enrichmentResult
      });

      // Rate limiting
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

    const successful = results.filter(r => r.enrichment.found);
    const failed = results.filter(r => !r.enrichment.found);
    const dbUpdated = results.filter(r => r.enrichment.databaseUpdated);

    console.log(`\n✅ Successfully enriched: ${successful.length}/${results.length} companies`);
    console.log(`❌ Failed to enrich: ${failed.length}/${results.length} companies`);
    if (dbUpdated.length > 0) {
      console.log(`💾 Database updated: ${dbUpdated.length}/${results.length} companies`);
    }

    // Show successful enrichments
    if (successful.length > 0) {
      console.log('\n🎉 SUCCESSFUL ENRICHMENTS:');
      successful.forEach(result => {
        const company = result.original;
        const extracted = result.enrichment.extractedData;
        
        console.log(`\n📍 ${company.name}:`);
        console.log(`   Wikipedia: ${result.enrichment.wikipediaData.summary?.pageUrl}`);
        console.log(`   Fields updated: ${Object.keys(extracted).join(', ')}`);
        
        if (result.enrichment.databaseUpdated !== undefined) {
          console.log(`   Database: ${result.enrichment.databaseUpdated ? '✅ Updated' : '❌ Failed'}`);
        }
      });
    }

    return { successful, failed, dbUpdated };
  }
}

// MAIN EXECUTION
async function main() {
  const enricher = new SupabaseWikipediaEnricher();
  
  try {
    // Configuration
    const UPDATE_DATABASE = process.argv.includes('--update-db');
    
    console.log(`🔧 Mode: ${UPDATE_DATABASE ? 'UPDATE DATABASE' : 'PREVIEW ONLY'}\n`);

    // Run enrichment
    const results = await enricher.enrichDatabase(UPDATE_DATABASE);
    
    // Generate report
    const { successful, failed, dbUpdated } = enricher.generateReport(results);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENRICHMENT COMPLETE!');
    console.log('='.repeat(60));
    
    if (!UPDATE_DATABASE) {
      console.log('\n💡 This was a preview run. To update the database, use:');
      console.log('   yarn enrich-db -- --update-db');
    } else {
      console.log(`\n✅ Successfully updated ${dbUpdated.length} companies in your database!`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SupabaseWikipediaEnricher };