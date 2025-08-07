// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Hero from '@/components/NavBar';
import { Search, MapPin, Building2, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

const JOBS_PER_PAGE = 12;

export default async function JobsListingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, location, page } = resolvedSearchParams;
  const currentPage = parseInt(page || '1', 10);
  const offset = (currentPage - 1) * JOBS_PER_PAGE;

  let countQuery = supabase.from('job_listings_db').select('*', { count: 'exact', head: true });

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
    .from('job_listings_db')
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

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

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full-time':
        return 'bg-[#31C7FF]/10 text-[#31C7FF]';
      case 'part-time':
        return 'bg-orange-100 text-orange-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'remote':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {q || location ? (
                  <>Find Your Next <span className="text-[#31C7FF]">Six-Figure Role</span></>
                ) : (
                  <>Premium <span className="text-[#31C7FF]">Job Opportunities</span></>
                )}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {q || location ? (
                  <>
                    <strong className="text-gray-900">{totalJobs}</strong> jobs found
                    {q && <span> for &quot;{q}&quot;</span>}
                    {location && <span> in &quot;{location}&quot;</span>}

                  </>
                ) : (
                  <>Browse <strong className="text-gray-900">{totalJobs}</strong> curated high-paying opportunities from top companies</>
                )}
              </p>

              {/* Enhanced Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <form method="GET" action="/jobs" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="q"
                        defaultValue={q || ''}
                        placeholder="Job title, keywords, or company"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="location"
                        defaultValue={location || ''}
                        placeholder="City, state, or 'remote'"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500 font-medium">Popular:</span>
                      <Link href="/jobs?q=Software Engineer&location=Remote" className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors">
                        Remote Software Engineer
                      </Link>
                      <Link href="/jobs?q=Product Manager" className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors">
                        Product Manager
                      </Link>
                      <Link href="/jobs?q=Data Scientist&location=San Francisco" className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors">
                        Data Scientist
                      </Link>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-8 py-4 bg-[#31C7FF] hover:bg-[#28B4E6] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
                      >
                        Search Jobs
                        <Search className="w-5 h-5 ml-2" />
                      </button>
                      {(q || location) && (
                        <Link
                          href="/jobs"
                          className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center"
                        >
                          Clear Filters
                        </Link>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {jobs.map((job: Job) => (
                <Link key={job.JobID} href={`/jobs/${job.slug}`} className="block group">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        {job.CompanyLogo && (
                          <div className="flex-shrink-0">
                            <Image
                              src={job.CompanyLogo}
                              alt={`${job.Company} logo`}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#31C7FF] transition-colors line-clamp-2 mb-1">
                            {job.JobTitle}
                          </h3>
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">{job.Company}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {job.ShortDescription}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{job.Location}</span>
                        {job.is_remote && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Remote
                          </span>
                        )}
                      </div>

                      {job.formatted_salary && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm font-semibold text-[#31C7FF]">{job.formatted_salary}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{formatDate(job.PostedDate)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.JobType)}`}>
                        {job.JobType}
                      </span>
                      <span className="text-[#31C7FF] text-sm font-medium group-hover:text-[#28B4E6] transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all available positions.</p>
              <Link
                href="/jobs"
                className="inline-flex items-center px-6 py-3 bg-[#31C7FF] hover:bg-[#28B4E6] text-white font-semibold rounded-lg transition-all duration-200"
              >
                Browse All Jobs
              </Link>
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{offset + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(offset + JOBS_PER_PAGE, totalJobs || 0)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalJobs}</span> results
                </div>

                <div className="flex items-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={createPageUrl(currentPage - 1)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Link>
                  )}

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <Link
                          key={pageNum}
                          href={createPageUrl(pageNum)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === currentPage
                              ? 'bg-[#31C7FF] text-white'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>

                  {currentPage < totalPages && (
                    <Link
                      href={createPageUrl(currentPage + 1)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}