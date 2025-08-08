// scripts/bulk-import-companies.ts
import 'dotenv/config';
import { createCompanySlug, normalizeCompanyName } from '@/lib/dbSync';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


interface CompanyImportData {
  name: string;
  short_name?: string;
  website?: string;
  headquarters?: string;
  industry?: string;
  size?: string;
  year_founded?: number;
  description?: string;
  company_logo?: string;
  overall_rating?: number;
  career_rating?: number;
  ceo_name?: string;
  ceo_title?: string;
}

/**
 * Extract unique companies from job listings
 */
async function extractCompaniesFromJobs(): Promise<CompanyImportData[]> {
  console.log('📊 Extracting companies from job listings...');
  
  const { data: jobs, error } = await supabase
    .from('job_listings_db')
    .select('Company, Location')
    .not('Company', 'is', null);

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  // Get unique companies
  const uniqueCompanies = new Map<string, CompanyImportData>();
  
  jobs?.forEach(job => {
    const normalizedName = normalizeCompanyName(job.Company);
    if (!uniqueCompanies.has(normalizedName)) {
      uniqueCompanies.set(normalizedName, {
        name: job.Company,
        short_name: job.Company,
        headquarters: extractHeadquarters(job.Location),
        description: `${job.Company} is actively hiring and has multiple job openings available.`
      });
    }
  });

  console.log(`✅ Found ${uniqueCompanies.size} unique companies from job listings`);
  return Array.from(uniqueCompanies.values());
}

/**
 * Extract headquarters from job location
 */
function extractHeadquarters(location: string): string | undefined {
  if (!location) return undefined;
  
  // Extract city/state from location string
  const locationParts = location.split(',').map(part => part.trim());
  if (locationParts.length >= 2) {
    return `${locationParts[0]}, ${locationParts[1]}`;
  }
  return location;
}

/**
 * Enrich company data with external APIs
 */
async function enrichCompanyData(companies: CompanyImportData[]): Promise<CompanyImportData[]> {
  console.log('🔍 Enriching company data...');
  
  const enrichedCompanies = await Promise.all(
    companies.map(async (company) => {
      try {
        // Try to get logo from Clearbit
        const logo = await getClearbitLogo(company.name);
        if (logo) {
          company.company_logo = logo;
        }

        // Add industry guessing based on company name
        company.industry = guessIndustry(company.name);
        
        return company;
      } catch (error) {
        console.log(`⚠️ Could not enrich data for ${company.name}`);
        return company;
      }
    })
  );

  return enrichedCompanies;
}

/**
 * Get company logo from Clearbit API
 */
async function getClearbitLogo(companyName: string): Promise<string | null> {
  try {
    // Try common domain patterns
    const domains = [
      `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      `${companyName.toLowerCase().replace(/\s+/g, '')}.io`,
      `${companyName.toLowerCase().replace(/\s+/g, '')}.net`,
    ];

    for (const domain of domains) {
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      
      // Test if logo exists
      const response = await fetch(logoUrl, { method: 'HEAD' });
      if (response.ok) {
        return logoUrl;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Guess industry based on company name
 */
function guessIndustry(companyName: string): string {
  const name = companyName.toLowerCase();
  
  if (name.includes('tech') || name.includes('software') || name.includes('data')) {
    return 'Technology';
  }
  if (name.includes('health') || name.includes('medical') || name.includes('pharma')) {
    return 'Healthcare';
  }
  if (name.includes('bank') || name.includes('financial') || name.includes('capital')) {
    return 'Financial Services';
  }
  if (name.includes('consulting')) {
    return 'Business Consulting';
  }
  if (name.includes('education') || name.includes('university')) {
    return 'Education';
  }
  if (name.includes('government') || name.includes('federal')) {
    return 'Government';
  }
  
  return 'Other';
}

/**
 * Check if company already exists in database
 */
async function checkExistingCompanies(companies: CompanyImportData[]): Promise<CompanyImportData[]> {
  console.log('🔍 Checking for existing companies...');
  
  const { data: existingCompanies } = await supabase
    .from('company_db')
    .select('name, short_name');

  const existingNames = new Set(
    existingCompanies?.map(company => 
      normalizeCompanyName(company.name)
    ) || []
  );

  const newCompanies = companies.filter(company => 
    !existingNames.has(normalizeCompanyName(company.name))
  );

  console.log(`✅ Found ${newCompanies.length} new companies to import`);
  return newCompanies;
}

/**
 * Batch insert companies into database with duplicate handling
 */
async function batchInsertCompanies(companies: CompanyImportData[]): Promise<void> {
  console.log(`📤 Inserting ${companies.length} companies...`);
  
  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE);
    
    // Generate unique slugs for this batch
    const companiesWithSlugs = await generateUniqueSlugsBatch(batch);

    try {
      const { error } = await supabase
        .from('company_db')
        .insert(companiesWithSlugs);

      if (error) {
        console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        
        // Try inserting one by one to identify problematic records
        console.log(`🔄 Retrying batch ${i / BATCH_SIZE + 1} individually...`);
        const individualResults = await insertIndividually(companiesWithSlugs);
        successCount += individualResults.success;
        errorCount += individualResults.errors;
      } else {
        console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} companies)`);
        successCount += batch.length;
      }
    } catch (error) {
      console.error(`❌ Error with batch ${i / BATCH_SIZE + 1}:`, error);
      errorCount += batch.length;
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`✅ Successfully imported: ${successCount} companies`);
  console.log(`❌ Failed to import: ${errorCount} companies`);
}

/**
 * Generate unique slugs for a batch, handling duplicates
 */
async function generateUniqueSlugsBatch(companies: CompanyImportData[]) {
  // Get existing slugs from database
  const { data: existingSlugs } = await supabase
    .from('company_db')
    .select('slug');

  const existingSlugSet = new Set(existingSlugs?.map(item => item.slug) || []);
  
  return companies.map(company => {
    let baseSlug = createCompanySlug(company.name);
    let finalSlug = baseSlug;
    let counter = 1;

    // If slug exists, add a number suffix
    while (existingSlugSet.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Add to our set to prevent duplicates within this batch
    existingSlugSet.add(finalSlug);

    return {
      ...company,
      slug: finalSlug,
      created_at: new Date().toISOString(),
    };
  });
}

/**
 * Insert companies one by one when batch fails
 */
async function insertIndividually(companies: any[]) {
  let success = 0;
  let errors = 0;

  for (const company of companies) {
    try {
      const { error } = await supabase
        .from('company_db')
        .insert([company]);

      if (error) {
        console.log(`⚠️  Skipped ${company.name}: ${error.message}`);
        errors++;
      } else {
        success++;
      }
    } catch (error) {
      console.log(`⚠️  Error with ${company.name}:`, error);
      errors++;
    }
  }

  return { success, errors };
}

/**
 * Main bulk import function
 */
export async function bulkImportCompanies() {
  console.log('🚀 Starting bulk company import...\n');

  try {
    // Step 1: Extract companies from job listings
    let companies = await extractCompaniesFromJobs();
    
    if (companies.length === 0) {
      console.log('❌ No companies found to import');
      return;
    }

    // Step 2: Check for existing companies
    companies = await checkExistingCompanies(companies);
    
    if (companies.length === 0) {
      console.log('✅ All companies already exist in database');
      return;
    }

    // Step 3: Enrich company data
    companies = await enrichCompanyData(companies);

    // Step 4: Insert into database
    await batchInsertCompanies(companies);

  } catch (error) {
    console.error('❌ Bulk import failed:', error);
  }
}

// ========================================
// 2. MANUAL COMPANY DATA (HIGH-VALUE COMPANIES)
// ========================================

const HIGH_VALUE_COMPANIES: CompanyImportData[] = [
  {
    name: 'Meta Platforms Inc.',
    short_name: 'Meta',
    website: 'https://meta.com',
    headquarters: 'Menlo Park, California',
    industry: 'Technology',
    size: '10,000+ employees',
    year_founded: 2004,
    description: 'Meta builds technologies that help people connect, find communities, and grow businesses.',
    company_logo: 'https://logo.clearbit.com/meta.com',
    overall_rating: 4.1,
    career_rating: 4.0,
    ceo_name: 'Mark Zuckerberg',
    ceo_title: 'CEO'
  },
  {
    name: 'Google LLC',
    short_name: 'Google',
    website: 'https://google.com',
    headquarters: 'Mountain View, California',
    industry: 'Technology',
    size: '10,000+ employees',
    year_founded: 1998,
    description: 'Google\'s mission is to organize the world\'s information and make it universally accessible and useful.',
    company_logo: 'https://logo.clearbit.com/google.com',
    overall_rating: 4.4,
    career_rating: 4.2,
    ceo_name: 'Sundar Pichai',
    ceo_title: 'CEO'
  },
  {
    name: 'Microsoft Corporation',
    short_name: 'Microsoft',
    website: 'https://microsoft.com',
    headquarters: 'Redmond, Washington',
    industry: 'Technology',
    size: '10,000+ employees',
    year_founded: 1975,
    description: 'Microsoft empowers every person and organization on the planet to achieve more.',
    company_logo: 'https://logo.clearbit.com/microsoft.com',
    overall_rating: 4.4,
    career_rating: 4.1,
    ceo_name: 'Satya Nadella',
    ceo_title: 'CEO'
  },
  {
    name: 'Amazon.com Inc.',
    short_name: 'Amazon',
    website: 'https://amazon.com',
    headquarters: 'Seattle, Washington',
    industry: 'E-commerce & Cloud Computing',
    size: '10,000+ employees',
    year_founded: 1994,
    description: 'Amazon is guided by four principles: customer obsession, ownership, invention, and long-term thinking.',
    company_logo: 'https://logo.clearbit.com/amazon.com',
    overall_rating: 3.9,
    career_rating: 3.7,
    ceo_name: 'Andy Jassy',
    ceo_title: 'CEO'
  },
  {
    name: 'Apple Inc.',
    short_name: 'Apple',
    website: 'https://apple.com',
    headquarters: 'Cupertino, California',
    industry: 'Technology',
    size: '10,000+ employees',
    year_founded: 1976,
    description: 'Apple designs and creates iPod and iTunes, Mac laptop and desktop computers, the OS X operating system, and the revolutionary iPhone and iPad.',
    company_logo: 'https://logo.clearbit.com/apple.com',
    overall_rating: 4.3,
    career_rating: 4.0,
    ceo_name: 'Tim Cook',
    ceo_title: 'CEO'
  }
];

/**
 * Import high-value companies
 */
export async function importHighValueCompanies() {
  console.log('💎 Importing high-value companies...');

  try {
    const companiesWithSlugs = HIGH_VALUE_COMPANIES.map(company => ({
      ...company,
      slug: createCompanySlug(company.name),
      created_at: new Date().toISOString(),
    }));

    console.log('🚚 Payload for upsert:', JSON.stringify(companiesWithSlugs, null, 2));

    const { error, data, status } = await supabase
      .from('company_db')
      .upsert(companiesWithSlugs, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Supabase error object:', error);
      console.error('❌ Full response:', { status, data });
    } else {
      console.log(`✅ Successfully imported ${HIGH_VALUE_COMPANIES.length} high-value companies`);
    }
  } catch (error) {
    console.error('❌ Failed to import high-value companies:', error);
  }
}

// ========================================
// 3. COMMAND LINE INTERFACE
// ========================================

/**
 * CLI for running import scripts
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'bulk':
      await bulkImportCompanies();
      break;
    case 'high-value':
      await importHighValueCompanies();
      break;
    case 'all':
      await importHighValueCompanies();
      await bulkImportCompanies();
      break;
    default:
      console.log(`
🏢 Company Import Tool

Usage:
  npm run import-companies bulk        # Import from job listings
  npm run import-companies high-value  # Import high-value companies
  npm run import-companies all         # Import both

Commands:
  bulk       Extract companies from job_listings_db and import
  high-value Import curated list of major companies
  all        Run both import types
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

// ========================================
// 4. PACKAGE.JSON SCRIPT
// ========================================

/*
Add this to your package.json scripts section:

{
  "scripts": {
    "import-companies": "tsx scripts/bulk-import-companies.ts"
  }
}

Then run:
npm install tsx --save-dev
npm run import-companies all
*/

// ========================================
// 5. ADMIN INTERFACE (OPTIONAL)
// ========================================

// src/app/admin/import/page.tsx
export const AdminImportPage = `
'use client';

import { useState } from 'react';

export default function AdminImportPage() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runImport = async (type: string) => {
    setImporting(true);
    setResults([]);
    
    try {
      const response = await fetch('/api/admin/import-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      const data = await response.json();
      setResults(data.logs || ['Import completed']);
    } catch (error) {
      setResults(['Error: ' + error.message]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Company Import Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => runImport('high-value')}
          disabled={importing}
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <h3 className="font-bold mb-2">High-Value Companies</h3>
          <p className="text-sm">Import major tech companies with full data</p>
        </button>
        
        <button
          onClick={() => runImport('bulk')}
          disabled={importing}
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <h3 className="font-bold mb-2">Bulk Import</h3>
          <p className="text-sm">Extract companies from job listings</p>
        </button>
        
        <button
          onClick={() => runImport('all')}
          disabled={importing}
          className="p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <h3 className="font-bold mb-2">Import All</h3>
          <p className="text-sm">Run both import types</p>
        </button>
      </div>

      {importing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-700">Import in progress...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">Import Results:</h3>
          <div className="space-y-1 text-sm font-mono">
            {results.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
`;

// ========================================
// 6. API ENDPOINT (OPTIONAL)
// ========================================

// src/app/api/admin/import-companies/route.ts
export const ImportAPIRoute = `
import { NextRequest, NextResponse } from 'next/server';
import { bulkImportCompanies, importHighValueCompanies } from '../../../../scripts/bulk-import-companies';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    switch (type) {
      case 'bulk':
        await bulkImportCompanies();
        break;
      case 'high-value':
        await importHighValueCompanies();
        break;
      case 'all':
        await importHighValueCompanies();
        await bulkImportCompanies();
        break;
      default:
        return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'Import completed' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;