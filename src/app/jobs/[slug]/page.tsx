// src/app/jobs/[slug]/page.tsx - CORRECTED WITH ALL ORIGINAL ELEMENTS
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PostgrestError } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { getCompanyLogo, getCompanyPageUrl, findCompanyMatch } from '@/lib/dbSync';

import SaveButton from '@/components/SaveButton';
import Hero from '@/components/NavBar';
import Footer from '@/components/Footer';

interface Job {
  JobID: string;
  CompanyLogo: string | null;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  JobType: string;
  LongDescription: string;
  ShortDescription: string;
  job_url: string;
  slug: string;
  id: string;
  is_remote: boolean;
  PostedDate: string;
}

// Title case utility (cleans up title)
function toTitleCase(str: string): string {
  const acronyms = new Set(["IT", "HR", "CEO", "VP", "UX", "UI", "AI", "ML", "CFO", "COO", "CTO", "GIS"]);

  return str.split(/(\s+|-|\(|\))/g)
    .map(word => {
      const clean = word.replace(/[^a-zA-Z]/g, '');
      if (acronyms.has(clean.toUpperCase())) {
        return clean.toUpperCase();
      }
      if (/^[a-zA-Z]/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join('');
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// Helper function to check if job is remote/hybrid
function getWorkArrangement(location: string, jobType: string): { type: 'remote' | 'hybrid' | 'onsite', label: string } {
  const locationLower = location.toLowerCase();
  const jobTypeLower = jobType.toLowerCase();

  if (locationLower.includes('remote') || jobTypeLower.includes('remote')) {
    return { type: 'remote', label: 'Remote' };
  }
  if (locationLower.includes('hybrid') || jobTypeLower.includes('hybrid')) {
    return { type: 'hybrid', label: 'Hybrid' };
  }
  return { type: 'onsite', label: 'On-site' };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SEO: Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: job } = await supabase
    .from('job_listings_db')
    .select('JobTitle, Company, ShortDescription, Location, formatted_salary, JobType')
    .eq('slug', slug)
    .single();

  if (!job) {
    return {
      title: 'Job Not Found | SixFigHires.com',
      description: 'The requested job posting could not be found.'
    };
  }

  const brand = ' | SixFigHires.com';
  const maxTotalLength = 60;

  const formattedJobTitle = toTitleCase(job.JobTitle);
  const rawTitle = `${formattedJobTitle} @ ${job.Company}`;

  const truncatedTitle =
    rawTitle.length + brand.length > maxTotalLength
      ? rawTitle.slice(0, maxTotalLength - brand.length - 1).trim().replace(/[\s.,-]+$/, '') + '…'
      : rawTitle;

  const finalTitle = `${truncatedTitle}${brand}`;

  return {
    title: finalTitle,
    description: job.ShortDescription || `Join ${job.Company} as a ${job.JobTitle} in ${job.Location}. ${job.formatted_salary ? `Salary: ${job.formatted_salary}` : 'Competitive salary offered.'}`,
    keywords: `${job.JobTitle}, ${job.Company}, ${job.Location}, six figure jobs, high paying jobs, ${job.JobType}`,
    openGraph: {
      title: finalTitle,
      description: job.ShortDescription || `Join ${job.Company} as a ${job.JobTitle}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: job.ShortDescription || `Join ${job.Company} as a ${job.JobTitle}`,
    }
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: job, error }: { data: Job | null; error: PostgrestError | null } = await supabase
    .from('job_listings_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    console.error('Job not found or Supabase error:', error);
    notFound();
  }

  // ✅ MOVE ALL ASYNC OPERATIONS TO SERVER-SIDE
  // Enhanced company data retrieval with logo fallback
  const [companyLogo, companyPageUrl] = await Promise.all([
    getCompanyLogo(job.Company, job.CompanyLogo, supabase),
    getCompanyPageUrl(job.Company, supabase)
  ]);

  // Get detailed company information for additional context
  const { data: companies } = await supabase
    .from('companies_db')
    .select('*');

  const matchedCompany = companies ? findCompanyMatch(job.Company, companies) : null;

  // Get company data from companies_db (original logic)
  const companySlug = job.Company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { data: companyData } = await supabase
    .from('companies_db')
    .select('slug, overall_rating, career_rating, ceo_name, ceo_photo, website, name, short_name, updated_at, id')
    .eq('slug', companySlug)
    .single();

  // ✅ FETCH SIMILAR JOBS ON SERVER-SIDE
  const { data: similarJobs } = await supabase
    .from('job_listings_db')
    .select('JobID, JobTitle, Company, Location, formatted_salary, slug, CompanyLogo')
    .neq('JobID', job.JobID)
    .eq('JobType', job.JobType)
    .limit(4);

  // ✅ ENHANCE SIMILAR JOBS ON SERVER-SIDE
  const enhancedSimilarJobs = await Promise.all(
    (similarJobs || []).map(async (similarJob) => ({
      ...similarJob,
      CompanyLogo: await getCompanyLogo(similarJob.Company, similarJob.CompanyLogo, supabase),
      companyPageUrl: await getCompanyPageUrl(similarJob.Company, supabase)
    }))
  );

  const workArrangement = getWorkArrangement(job.Location, job.JobType);

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.JobTitle,
    "description": job.ShortDescription || job.LongDescription,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.Company,
      "value": job.id
    },
    "datePosted": new Date().toISOString(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.Company,
      "logo": companyLogo || job.CompanyLogo
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.Location
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.formatted_salary,
        "unitText": "YEAR"
      }
    },
    "aggregateRating": companyData?.overall_rating ? {
      "@type": "AggregateRating",
      "ratingValue": companyData.overall_rating,
      "ratingCount": 100
    } : undefined,
    "employmentType": job.JobType.toUpperCase()
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <Hero />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb Navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                  Jobs
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {job.JobTitle}
                </span>
              </li>
            </ol>
          </nav>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {/* Enhanced Company Logo with Fallback */}
                  {companyLogo && (
                    <div className="flex-shrink-0">
                      <Image
                        src={companyLogo}
                        alt={`${job.Company} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded-lg border border-gray-200 p-2"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{toTitleCase(job.JobTitle)}</h1>
                    {/* Enhanced Company Name with Link */}
                    {companyPageUrl ? (
                      <Link
                        href={companyPageUrl}
                        className="text-lg text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {job.Company}
                      </Link>
                    ) : (
                      <h2 className="text-lg text-gray-600 font-medium">{job.Company}</h2>
                    )}

                    {/* Show additional company info if available */}
                    {matchedCompany && (
                      <div className="mt-2">
                        {matchedCompany.industry && (
                          <p className="text-sm text-gray-500">{matchedCompany.industry}</p>
                        )}
                        {matchedCompany.overall_rating && (
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {matchedCompany.overall_rating}/5.0
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ← RESTORED: Job Description Badges */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.Location}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.JobType}
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${workArrangement.type === 'remote' ? 'bg-green-100 text-green-800' :
                      workArrangement.type === 'hybrid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {workArrangement.label}
                    </span>
                  </div>
                  {job.formatted_salary && (
                    <div className="flex items-center font-semibold text-green-600">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {job.formatted_salary}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      Apply Now
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <SaveButton JobID={job.JobID} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Overview Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Role Overview:</h3>
                <p className="text-gray-700 leading-relaxed">{job.ShortDescription}</p>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description:</h3>
                <div className="prose prose-gray max-w-none">
                  {(job.LongDescription || '').split('\n').map((line: string, idx: number) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>


            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Job Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Job Details</h4>
                <div className="space-y-3">
                  {/* ← RESTORED: Salary Badge with Green Color */}
                  {job.formatted_salary && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-600">Salary</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{job.formatted_salary}</span>
                    </div>
                  )}

                  {/* ← RESTORED: Job Type Badge with Blue Color */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-600">Job Type</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{job.JobType}</span>
                  </div>

                  {/* Work Style Badge */}
                  {workArrangement && (
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${workArrangement.type === 'remote'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-orange-50 border-orange-200'
                      }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${workArrangement.type === 'remote'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                          }`}></div>
                        <span className="text-sm font-medium text-gray-600">Work Style</span>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${workArrangement.type === 'remote'
                        ? 'text-purple-600 bg-purple-100'
                        : 'text-orange-600 bg-orange-100'
                        }`}>
                        {workArrangement.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ← FIXED: Company Rating Card with Glassdoor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Rating</h3>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Glassdoor Rating</div>

                  {/* Star Rating */}
                  <div className="flex items-center justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${companyData?.overall_rating && star <= Math.round(companyData.overall_rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                          }`}
                        fill="currentColor"
                        viewBox="0 0 22 20"
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                    ))}
                  </div>

                  {companyData?.overall_rating !== undefined && companyData?.overall_rating !== null ? (
                    <>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {companyData.overall_rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">out of 5 stars</div>

                      {/* Enhanced info section */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="text-xs text-gray-500">
                          Based on employee reviews
                        </div>

                        {/* Data freshness indicator */}
                        {companyData.updated_at && (
                          <div className="text-xs text-gray-400">
                            Updated {formatTimeAgo(companyData.updated_at)}
                          </div>
                        )}

                        {/* Career Rating if available */}
                        {companyData.career_rating && (
                          <div className="text-xs text-gray-600 mt-2">
                            Career Opportunities: {companyData.career_rating.toFixed(1)}/5
                          </div>
                        )}

                        {/* Link to search Glassdoor */}
                        <a
                          href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(job.Company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          View on Glassdoor
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-500 text-sm italic mb-1">Not yet rated</div>
                      <div className="text-sm text-gray-400">No available Glassdoor rating</div>

                      {/* Encourage users to check Glassdoor directly */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-2">
                          Want to know more about this company?
                        </div>
                        <a
                          href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(job.Company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Search on Glassdoor →
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Company Info Card (Enhanced with matched company data) */}
              {matchedCompany && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">About {job.Company}</h4>
                  <div className="space-y-3">
                    {matchedCompany.industry && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-medium">{matchedCompany.industry}</span>
                      </div>
                    )}
                    {matchedCompany.headquarters && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Headquarters</span>
                        <span className="font-medium">{matchedCompany.headquarters}</span>
                      </div>
                    )}
                    {matchedCompany.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Size</span>
                        <span className="font-medium">{matchedCompany.size}</span>
                      </div>
                    )}
                    {matchedCompany.overall_rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-medium">{matchedCompany.overall_rating}/5.0</span>
                        </div>
                      </div>
                    )}
                    {companyPageUrl && (
                      <Link
                        href={companyPageUrl}
                        className="inline-block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 mt-3"
                      >
                        View Company Profile
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Similar Jobs Section - No async in JSX */}
      {enhancedSimilarJobs && enhancedSimilarJobs.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Similar Jobs</h3>
              <p className="text-lg text-gray-600">More opportunities you might be interested in</p>
            </div>

            {/* Full Width 1x4 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {enhancedSimilarJobs.map((similarJob) => (
                <div key={similarJob.JobID} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">

                  {/* Company Logo Circle */}
                  <div className="flex justify-center mb-6">
                    {similarJob.CompanyLogo ? (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <Image
                          src={similarJob.CompanyLogo}
                          alt={`${similarJob.Company} logo`}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">
                          {similarJob.Company.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="text-center mb-4">
                    {similarJob.companyPageUrl ? (
                      <Link
                        href={similarJob.companyPageUrl}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        {similarJob.Company}
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-600 font-semibold">{similarJob.Company}</p>
                    )}
                  </div>

                  {/* Job Title */}
                  <h4 className="text-xl font-bold text-gray-900 mb-4 text-center line-clamp-2 leading-tight min-h-[3.5rem]">
                    <Link href={`/jobs/${similarJob.slug}`} className="hover:text-blue-600 transition-colors">
                      {similarJob.JobTitle}
                    </Link>
                  </h4>

                  {/* Location */}
                  <p className="text-base text-gray-600 text-center mb-6 font-medium">
                    {similarJob.Location}
                  </p>

                  {/* Salary */}
                  <div className="text-center mb-6">
                    <span className="text-xl font-bold text-green-600">
                      {similarJob.formatted_salary || 'Competitive Salary'}
                    </span>
                  </div>

                  {/* View Job Button */}
                  <div className="text-center">
                    <Link
                      href={`/jobs/${similarJob.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      View Job
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}