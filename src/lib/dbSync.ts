// src/lib/dbSync.ts
import { SupabaseClient } from '@supabase/supabase-js';

interface Company {
  id?: string;
  name: string;
  short_name?: string | null;
  company_logo?: string | null;
  slug?: string;
  industry?: string;
  headquarters?: string;
  size?: string;
  overall_rating?: number;
  description?: string; // Add this for company page
  // Add other fields as needed
}

/**
 * Normalize company names for matching
 */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .replace(/(inc|llc|corp|ltd|co|company|technologies|tech|solutions|systems)$/g, '') // Remove common suffixes
    .trim();
}

/**
 * Create URL-friendly slug from company name
 */
export function createCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Fuzzy match company names between job listings and company database
 */
export function findCompanyMatch(jobCompanyName: string, companies: Company[]): Company | null {
  if (!jobCompanyName || !companies.length) return null;

  const normalizedJobName = normalizeCompanyName(jobCompanyName);

  // 1. Try exact match first
  const exactMatch = companies.find(company =>
    normalizeCompanyName(company.name) === normalizedJobName ||
    normalizeCompanyName(company.short_name || '') === normalizedJobName
  );
  if (exactMatch) return exactMatch;

  // 2. Try partial match (job name contains company name or vice versa)
  const partialMatch = companies.find(company => {
    const normalizedCompanyName = normalizeCompanyName(company.name);
    const normalizedShortName = normalizeCompanyName(company.short_name || '');

    return normalizedJobName.includes(normalizedCompanyName) ||
      normalizedCompanyName.includes(normalizedJobName) ||
      (normalizedShortName && (
        normalizedJobName.includes(normalizedShortName) ||
        normalizedShortName.includes(normalizedJobName)
      ));
  });

  return partialMatch || null;
}

/**
 * Get company logo with fallback logic
 */
export async function getCompanyLogo(
  jobCompanyName: string,
  jobCompanyLogo: string | null,
  supabase: SupabaseClient
): Promise<string | null> {
  // 1. If job already has a logo, use it
  if (jobCompanyLogo) {
    return jobCompanyLogo;
  }

  // 2. Try to find company in company database
  try {
    const { data: companies } = await supabase
      .from('companies_db')
      .select('id, name, short_name, company_logo, slug') // Add 'id'
      .not('company_logo', 'is', null);

    if (!companies || companies.length === 0) {
      return null;
    }

    const matchedCompany = findCompanyMatch(jobCompanyName, companies);
    return matchedCompany?.company_logo || null;

  } catch (error) {
    console.error('Error fetching company logo:', error);
    return null;
  }
}

/**
 * Get company page URL with fallback slug creation
 */
export async function getCompanyPageUrl(
  jobCompanyName: string,
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    // First try to find exact company match
    const { data: companies } = await supabase
      .from('companies_db')
      .select('id, name, short_name, slug, company_logo'); // Add 'id' and 'company_logo'

    if (!companies || companies.length === 0) {
      return `/company/${createCompanySlug(jobCompanyName)}`;
    }

    const matchedCompany = findCompanyMatch(jobCompanyName, companies);

    if (matchedCompany && matchedCompany.slug) {
      return `/company/${matchedCompany.slug}`;
    }

    // Fallback: create slug from job company name
    return `/company/${createCompanySlug(jobCompanyName)}`;

  } catch (error) {
    console.error('Error getting company page URL:', error);
    return `/company/${createCompanySlug(jobCompanyName)}`;
  }
}