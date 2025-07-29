// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

interface Job {
  JobID: string;
  JobTitle: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  JobType: string;
  formatted_salary: string;
  slug: string;
  PostedDate: string;
  is_remote: boolean;
  CompanyLogo?: string;
}

interface PageProps {
  searchParams: Promise<{ q?: string; location?: string; page?: string }>;
}

const JOBS_PER_PAGE = 20;

export default async function JobsListingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, location, page } = resolvedSearchParams;
  const currentPage = parseInt(page || '1', 10);
  const offset = (currentPage - 1) * JOBS_PER_PAGE;

  let countQuery = supabase.from('jobs_db').select('*', { count: 'exact', head: true });

  if (q) {
    countQuery = countQuery.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }
  if (location) {
    countQuery = countQuery.or(
      `Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`
    );
  }

  const { count: totalJobs } = await countQuery;
  const totalPages = Math.ceil((totalJobs || 0) / JOBS_PER_PAGE);

  let query = supabase
    .from('jobs_db')
    .select('*')
    .order('PostedDate', { ascending: false })
    .range(offset, offset + JOBS_PER_PAGE - 1);

  if (q) {
    query = query.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }
  if (location) {
    query = query.or(
      `Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`
    );
  }

  const { data: jobs, error } = await query;
  if (error) return <div className="p-6 text-red-600">Error loading jobs: {error.message}</div>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    if (pageNum > 1) params.set('page', pageNum.toString());
    return `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-10 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {q || location ? 'Search Results' : 'All Jobs'}
            </h1>
            <p className="text-gray-600 mb-6">
              {q || location ? (
                <>
                  {totalJobs} jobs found
                  {q && <span> for "{q}"</span>}
                  {location && <span> in "{location}"</span>}
                </>
              ) : (
                `Browse ${totalJobs} available six-figure opportunities`
              )}
            </p>

            {/* Search Bar */}
            <form method="GET" action="/jobs" className="flex flex-col lg:flex-row gap-4">
              <div className="relative w-full lg:w-1/2">
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ''}
                  placeholder="Search for jobs, companies, or keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="w-full lg:w-1/3">
                <input
                  type="text"
                  name="location"
                  defaultValue={location || ''}
                  placeholder="Location or 'remote'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Search
                </button>
                {(q || location) && (
                  <Link
                    href="/jobs"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job: Job) => (
                    <tr key={job.JobID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${job.slug}`} className="block group">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{job.JobTitle}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.ShortDescription}</p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {job.CompanyLogo && (
                            <div className="flex-shrink-0 mr-3">
                              <Image src={job.CompanyLogo} alt={`${job.Company} logo`} width={32} height={32} className="w-8 h-8 object-contain rounded" />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{job.Company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">{job.Location}</span>
                          {job.is_remote && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Remote</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-green-600">{job.formatted_salary || '—'}</span>
                      </td>
                      <td className="px-6 py-4 w-32">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {job.JobType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(job.PostedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-8">
              <div className="text-sm text-gray-700">
                Showing {offset + 1} to {Math.min(offset + JOBS_PER_PAGE, totalJobs || 0)} of {totalJobs} results
              </div>
              <div className="flex items-center space-x-2">
                {currentPage > 1 && (
                  <Link
                    href={createPageUrl(currentPage - 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Link
                      key={pageNum}
                      href={createPageUrl(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link
                    href={createPageUrl(currentPage + 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}