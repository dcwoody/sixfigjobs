// scripts/enrichCompanies.js
// Run this script to enrich your company database with Wikipedia data

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

class WikipediaEnricher {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.searchUrl = 'https://en.wikipedia.org/w/api.php';
    this.delay = 1000; // 1 second delay between requests
  }

  async searchWikipedia(companyName) {
    try {
      // Try multiple search strategies
      const searchTerms = [
        companyName,
        `${companyName} company`,
        `${companyName} corporation`,
        `${companyName} agency`,
        `${companyName} government`,
        `${companyName} organization`
      ];

      for (const term of searchTerms) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: term,
          srlimit: '5',
          origin: '*'
        });

        const response = await fetch(`${this.searchUrl}?${params}`);
        const data = await response.json();

        if (data.query?.search?.length > 0) {
          // Find the best match
          const bestMatch = data.query.search.find(result => 
            result.title.toLowerCase().includes(companyName.toLowerCase().split(' ')[0]) ||
            result.snippet.toLowerCase().includes(companyName.toLowerCase())
          ) || data.query.search[0];

          return {
            title: bestMatch.title,
            pageId: bestMatch.pageid,
            snippet: bestMatch.snippet.replace(/<[^>]*>/g, '')
          };
        }
        
        // Wait between search attempts
        await this.sleep(200);
      }
      return null;
    } catch (error) {
      console.error(`Wikipedia search error for ${companyName}:`, error.message);
      return null;
    }
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
      if (!pages) return null;

      const page = Object.values(pages)[0];
      if (page.missing) return null;

      return {
        extract: page.extract,
        fullurl: page.fullurl,
        categories: page.categories?.map(cat => cat.title.replace('Category:', '')) || []
      };
    } catch (error) {
      console.error('Error fetching page details:', error.message);
      return null;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractDataForCompany(wikipediaData) {
    const extracted = {};

    if (wikipediaData.summary?.description) {
      extracted.description = wikipediaData.summary.description;
    }

    if (wikipediaData.summary?.thumbnail || wikipediaData.summary?.originalImage) {
      extracted.company_logo = wikipediaData.summary.originalImage || wikipediaData.summary.thumbnail;
    }

    if (wikipediaData.summary?.pageUrl) {
      extracted.wikipedia_url = wikipediaData.summary.pageUrl;
    }

    // Extract mission from description if it contains mission-like keywords
    if (extracted.description) {
      const missionKeywords = ['mission', 'purpose', 'goal', 'objective', 'aim'];
      const sentences = extracted.description.split('. ');
      
      for (const sentence of sentences) {
        if (missionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
          extracted.mission = sentence + (sentence.endsWith('.') ? '' : '.');
          break;
        }
      }
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

      // Get page details
      const details = await this.getPageDetails(searchResult.title);
      await this.sleep(this.delay);

      const wikipediaData = {
        search: searchResult,
        summary: summary,
        details: details
      };

      const extractedData = this.extractDataForCompany(wikipediaData);

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

  async enrichDatabase(csvFilePath) {
    console.log('🚀 Starting Wikipedia enrichment...\n');

    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });

    const companies = parsed.data;
    const results = [];

    console.log(`📋 Found ${companies.length} companies to process\n`);

    // Process each company
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`[${i + 1}/${companies.length}]`);
      
      const enrichmentResult = await this.enrichCompany(company);
      
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
    console.log('\n' + '='.repeat(50));
    console.log('📊 ENRICHMENT REPORT');
    console.log('='.repeat(50));

    const successful = results.filter(r => r.enrichment.found);
    const failed = results.filter(r => !r.enrichment.found);

    console.log(`\n✅ Successfully enriched: ${successful.length}/${results.length} companies`);
    console.log(`❌ Failed to enrich: ${failed.length}/${results.length} companies\n`);

    // Show successful enrichments
    if (successful.length > 0) {
      console.log('🎉 SUCCESSFUL ENRICHMENTS:');
      successful.forEach(result => {
        const company = result.original;
        const extracted = result.enrichment.extractedData;
        
        console.log(`\n📍 ${company.name}:`);
        console.log(`   Wikipedia: ${result.enrichment.wikipediaData.summary?.pageUrl}`);
        
        Object.entries(extracted).forEach(([field, value]) => {
          if (field === 'description') {
            console.log(`   ${field}: ${value.substring(0, 100)}...`);
          } else {
            console.log(`   ${field}: ${value}`);
          }
        });
      });
    }

    // Show failed enrichments
    if (failed.length > 0) {
      console.log('\n❌ FAILED ENRICHMENTS:');
      failed.forEach(result => {
        const company = result.original;
        console.log(`   ${company.name}: ${result.enrichment.reason || result.enrichment.error}`);
      });
    }

    return { successful, failed };
  }

  generateUpdatedCSV(results, outputPath) {
    const updatedCompanies = results.map(result => {
      const company = { ...result.original };
      
      if (result.enrichment.found) {
        const extracted = result.enrichment.extractedData;
        
        // Only update fields that are currently empty
        Object.entries(extracted).forEach(([field, value]) => {
          if (value && (!company[field] || company[field] === '' || company[field].includes('example.com'))) {
            company[field] = value;
          }
        });
      }
      
      return company;
    });

    const csv = Papa.unparse(updatedCompanies);
    fs.writeFileSync(outputPath, csv);
    console.log(`\n💾 Updated CSV saved to: ${outputPath}`);
  }
}

// MAIN EXECUTION
async function main() {
  const enricher = new WikipediaEnricher();
  
  try {
    // File paths
    const inputCsvPath = './public/data/company_db.csv';
    const outputCsvPath = './public/data/company_db_enriched.csv';
    
    // Check if input file exists
    if (!fs.existsSync(inputCsvPath)) {
      console.error(`❌ Input file not found: ${inputCsvPath}`);
      process.exit(1);
    }

    // Run enrichment
    const results = await enricher.enrichDatabase(inputCsvPath);
    
    // Generate report
    enricher.generateReport(results);
    
    // Generate updated CSV
    enricher.generateUpdatedCSV(results, outputCsvPath);
    
    console.log('\n🎉 Enrichment complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WikipediaEnricher };