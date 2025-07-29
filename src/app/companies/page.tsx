// src/app/companies/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Companies | SixFigHires.com',
  description: 'Browse top companies hiring for six-figure positions. Find your next career opportunity with leading employers.',
  keywords: 'companies, employers, six figure jobs, high paying companies, careers',
};

interface Company {
  id: string;
  name: string;
  short_name: string;
  industry?: string;
  headquarters?: string;
  size?: string;
  company_logo?: string;
  overall_rating?: number;
  description?: string;
}

// Create URL-friendly slug from company name
function createSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function CompaniesPage() {
  const { data: companies } = await supabase
    .from('companies_db')
    .select('id, name, short_name, industry, headquarters, size, company_logo, overall_rating, description')
    .order('name', { ascending: true });

  // Group companies by industry
  const companiesByIndustry = companies?.reduce((acc, company) => {
    const industry = company.industry || 'Other';
    if (!acc[industry]) {
      acc[industry] = [];
    }
    acc[industry].push(company);
    return acc;
  }, {} as Record<string, Company[]>) || {};

  const industries = Object.keys(companiesByIndustry).sort();

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Top Companies
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover leading employers offering six-figure opportunities. Browse companies by industry and find your next career move.
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {companies?.length || 0}
                </div>
                <div className="text-gray-600">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {industries.length}
                </div>
                <div className="text-gray-600">Industries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {companies?.filter(c => c.overall_rating && c.overall_rating >= 4.0).length || 0}
                </div>
                <div className="text-gray-600">Highly Rated</div>
              </div>
            </div>
          </div>

          {/* Companies by Industry */}
          {industries.map((industry) => (
            <section key={industry} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                {industry}
                <span className="ml-3 text-sm font-normal bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {companiesByIndustry[industry].length} companies
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companiesByIndustry[industry].map((company) => (
                  <div key={company.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    
                    {/* Company Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {company.company_logo && (
                        <div className="flex-shrink-0">
                          <Image
                            src={company.company_logo}
                            alt={`${company.name} logo`}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain rounded-lg border border-gray-200 p-1"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {company.name}
                        </h3>
                        {company.headquarters && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {company.headquarters}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-3 mb-4">
                      {company.size && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {company.size}
                        </div>
                      )}

                      {/* Rating */}
                      {company.overall_rating && (
                        <div className="flex items-center text-sm">
                          <div className="flex items-center mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(company.overall_rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 22 20"
                              >
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-gray-600">{company.overall_rating.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {company.description}
                      </p>
                    )}

                    {/* View Company Button */}
                    <Link
                      href={`/company/${createSlug(company.name)}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      View Company Profile
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* No Companies Message */}
          {(!companies || companies.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No companies found</div>
              <p className="text-gray-400">Check back soon for more company profiles.</p>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}