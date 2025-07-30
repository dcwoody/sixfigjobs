// src/app/jobs/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PostgrestError } from '@supabase/supabase-js';
import { Metadata } from 'next';

import SaveButton from '@/components/SaveButton';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

interface Job {
  JobID: string;
  CompanyLogo: string;
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
}

// Title case utility (cleans up title)
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word =>
      word.length > 2
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(' ');
}

// Add this helper function for time formatting
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

// Add this helper function at the top with your other utility functions:
function createCompanySlug(companyName: string): string {
  return companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SEO: Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: job } = await supabase
    .from('jobs_db')
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

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: job, error }: { data: Job | null; error: PostgrestError | null } = await supabase
    .from('jobs_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    console.error('Job not found or Supabase error:', error);
    notFound();
  }

  // Get similar jobs
  const { data: similarJobs } = await supabase
    .from('jobs_db')
    .select('JobID, JobTitle, Company, Location, formatted_salary, slug')
    .neq('JobID', job.JobID)
    .eq('JobType', job.JobType)
    .limit(4);

  // Get company data from companies_db
  const companySlug = job.Company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data: companyData } = await supabase
    .from('companies_db')
    .select('overall_rating, career_rating, ceo_name, ceo_photo, website, name, short_name, updated_at, id')
    .eq('slug', companySlug)
    .single();

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
      "logo": job.CompanyLogo
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
      "ratingCount": 100 // optional estimate
    } : undefined,
    "employmentType": job.JobType.toUpperCase()
  };



  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/jobs/${slug}`;

  if (!job || error) {
    notFound(); // 👈 this triggers the actual 404 page
  }

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
                  {job.CompanyLogo && (
                    <div className="flex-shrink-0">
                      <Image
                        src={job.CompanyLogo}
                        alt={`${job.Company} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded-lg border border-gray-200 p-2"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{toTitleCase(job.JobTitle)}</h1>
                    {companyData?.slug ? (
                      <Link
                        href={`/company/${companyData.slug}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {companyData.name}
                      </Link>
                    ) : (
                      <span className="text-blue-600 font-medium">{job.Company}</span>
                    )}
                    <div className="flex items-center text-gray-600 mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.Location}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>

                <div className="space-y-4">
                  {/* Salary */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      <span className="text-sm font-medium text-gray-600">Salary</span>
                    </div>
                    <span className="text-base font-semibold text-gray-900">
                      {job.formatted_salary || 'Not disclosed'}
                    </span>
                  </div>

                  {/* Job Type */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-600">Job Type</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {job.JobType}
                    </span>
                  </div>

                  {/* Work Arrangement Badge */}
                  {(workArrangement.type === 'remote' || workArrangement.type === 'hybrid') && (
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${workArrangement.type === 'remote'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-orange-50 border-orange-200'
                      }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${workArrangement.type === 'remote' ? 'bg-purple-500' : 'bg-orange-500'
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

              {/* Company Rating Card */}
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
                          : 'text-gray-300'}`}
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

              {/* Share Job Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Job</h3>

                <div className="space-y-3">
                  {/* Email Share */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Check out this job: ${job.JobTitle} at ${job.Company}`)}&body=${encodeURIComponent(`I thought you might be interested in this position:\n\n${job.JobTitle} at ${job.Company}\n${job.ShortDescription}\n\nView details: ${currentUrl}`)}`}
                    className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Email Job</span>
                  </a>



                  {/* Social Share Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job: ${job.JobTitle} at ${job.Company}`)}&url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Apply Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Ready to Apply?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Don&apos;t miss out on this opportunity. Apply now and take the next step in your career.
                </p>
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Apply Now
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Similar Jobs Section */}
          {similarJobs && similarJobs.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Similar Jobs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarJobs.map((related) => (
                  <div key={related.JobID} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                    <h3 className="text-md font-semibold mb-1 text-gray-900">{related.JobTitle}</h3>
                    <p className="text-sm text-gray-600">{related.Company}</p>
                    <p className="text-sm text-gray-500">{related.Location}</p>
                    <p className="text-sm font-medium text-green-700">{related.formatted_salary}</p>
                    <Link
                      href={`/jobs/${related.slug}`}
                      className="text-sm mt-2 inline-block text-blue-600 hover:underline"
                    >
                      View Job →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
