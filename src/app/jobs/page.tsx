// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Hero from '@/components/NavBar';
import React from 'react';
import { Search, MapPin, DollarSign, ChevronLeft, ChevronRight, Filter, Heart, Building2, Clock, TrendingUp, Sparkles, X } from 'lucide-react';
import FilterSection from '@/components/FilterSection';

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
  searchParams: Promise<{
    q?: string;
    location?: string;
    page?: string;
    jobType?: string;
    workType?: string;
  }>;
}

const JOBS_PER_PAGE = 12;

export default async function JobsListingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { q, location, page, jobType, workType } = resolvedSearchParams;
  const currentPage = parseInt(page || '1', 10);
  const offset = (currentPage - 1) * JOBS_PER_PAGE;

let countQuery = supabase
  .from('job_listings_db')
  .select('*', { count: 'exact', head: true });

if (q) {
  countQuery = countQuery.or(
    `JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`
  );
}

if (location) {
  countQuery = countQuery.ilike('Location', `%${location}%`);

  if (location.toLowerCase().includes('remote')) {
    countQuery = countQuery.eq('is_remote', true);
  }
}

if (jobType) {
  countQuery = countQuery.eq('JobType', jobType);
}

if (workType === 'Remote') {
  countQuery = countQuery.eq('is_remote', true);
} else if (workType === 'On-site') {
  countQuery = countQuery.eq('is_remote', false);
}

  const { count: totalJobs } = await countQuery;
  const totalPages = Math.ceil((totalJobs || 0) / JOBS_PER_PAGE);

  let query = supabase
  .from('job_listings_db')
  .select('*')
  .order('PostedDate', { ascending: false })
  .range(offset, offset + JOBS_PER_PAGE - 1);

if (q) {
  query = query.or(
    `JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`
  );
}

if (location) {
  query = query.ilike('Location', `%${location}%`);

  if (location.toLowerCase().includes('remote')) {
    query = query.eq('is_remote', true);
  }
}

if (jobType) {
  query = query.eq('JobType', jobType);
}

if (workType === 'Remote') {
  query = query.eq('is_remote', true);
} else if (workType === 'On-site') {
  query = query.eq('is_remote', false);
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
    if (jobType) params.set('jobType', jobType);
    if (workType) params.set('workType', workType);
    if (pageNum > 1) params.set('page', pageNum.toString());
    return `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const createFilterUrl = (filterType: string, value: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location && filterType !== 'location') params.set('location', location);
    if (jobType && filterType !== 'jobType') params.set('jobType', jobType);
    if (workType && filterType !== 'workType') params.set('workType', workType);

    if (filterType === 'location') params.set('location', value);
    if (filterType === 'jobType') params.set('jobType', value);
    if (filterType === 'workType') params.set('workType', value);

    return `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    return `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full-time':
        return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border border-blue-200/50';
      case 'part-time':
        return 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50';
      case 'contract':
        return 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200/50';
      case 'freelance':
        return 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/50';
      case 'remote':
        return 'bg-gradient-to-r from-green-500/10 to-teal-500/10 text-green-700 border border-green-200/50';
      default:
        return 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-200/50';
    }
  };

  // DC region locations and other filter options
  const locations = [
    'Washington, D.C.',
    'Alexandria, VA',
    'Arlington, VA',
    'Remote',
  ];

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
  const workTypes = ['Remote', 'Hybrid', 'On-site'];

  const baseUrl = '/jobs';
  const existingParams = { q, location, jobType, workType };

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-white from-slate-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg/%3E%3Cg' fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

          <div className="relative max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover Your Next Opportunity
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Your Dream
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  Career Today
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Connect with top companies and discover opportunities that match your skills and aspirations
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-white/20">
                <form method="GET" action="/jobs" className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="q"
                      defaultValue={q || ''}
                      placeholder="Job title, keywords, or company"
                      className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      defaultValue={location || ''}
                      placeholder="City, state, or remote"
                      className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                  {/* Hidden inputs to preserve other filters */}
                  {jobType && <input type="hidden" name="jobType" value={jobType} />}
                  {workType && <input type="hidden" name="workType" value={workType} />}
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Search Jobs
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Filter className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  </div>
                  {(location || jobType || workType) && (
                    <Link
                      href={clearFilters()}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Clear All
                    </Link>
                  )}
                </div>

                {/* Location Filter */}
                <FilterSection
                  title="Location"
                  items={locations}
                  selectedItem={location}
                  filterType="location"
                  baseUrl={baseUrl}
                  existingParams={existingParams}
                  showCheckbox={true} // ✅ Add this
                  defaultOpen={false}
                />

                <FilterSection
                  title="Job Type"
                  items={jobTypes}
                  selectedItem={jobType}
                  filterType="jobType"
                  baseUrl={baseUrl}
                  existingParams={existingParams}
                  showCheckbox={true}
                  defaultOpen={false}
                />

                <FilterSection
                  title="Work Type"
                  items={workTypes}
                  selectedItem={workType}
                  filterType="workType"
                  baseUrl={baseUrl}
                  existingParams={existingParams}
                  showCheckbox={true}
                  isLast={true}
                />
              </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1">
              {/* Active Filters */}
              {(location || jobType || workType) && (
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                    {location && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                        Location: {location}
                        <Link href={createFilterUrl('location', '')} className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </Link>
                      </span>
                    )}
                    {jobType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                        {jobType}
                        <Link href={createFilterUrl('jobType', '')} className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </Link>
                      </span>
                    )}
                    {workType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm">
                        {workType}
                        <Link href={createFilterUrl('workType', '')} className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Jobs Count */}
              <div className="mb-8">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900 text-xl">{totalJobs}</span>
                    <span className="ml-1">amazing opportunities waiting</span>
                    {q && <span className="text-blue-600 font-medium"> for &quot;{q}&quot;</span>}
                  </p>
                </div>
              </div>

              {/* Jobs Grid */}
              {jobs && jobs.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {jobs.map((job: Job) => (
                    <div
                      key={job.JobID}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-6 mb-6">
                            {/* Company Logo */}
                            <div className="flex-shrink-0">
                              {job.CompanyLogo ? (
                                <Image
                                  src={job.CompanyLogo}
                                  alt={`${job.Company} logo`}
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 object-contain rounded-xl bg-gray-50 p-2 border border-gray-200 shadow-lg"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <Building2 className="w-7 h-7 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link href={`/jobs/${job.slug}`}>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer mb-2 leading-tight">
                                  {job.JobTitle}
                                </h3>
                              </Link>
                              <div className="flex items-center text-blue-600 font-semibold mb-4">
                                <span className="text-lg">{job.Company}</span>
                              </div>

                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="font-medium">{job.Location}</span>
                                </div>
                                {job.formatted_salary && (
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-bold text-gray-900">{job.formatted_salary}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>Posted {formatDate(job.PostedDate)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 text-base mb-6 leading-relaxed">
                            {job.ShortDescription}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getJobTypeColor(job.JobType)}`}>
                                {job.JobType}
                              </span>
                              {job.is_remote && (
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/50">
                                  Remote
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/jobs/${job.slug}`}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>

                        <button className="flex-shrink-0 ml-6 p-3 text-gray-400 hover:text-red-500 transition-all duration-200 hover:scale-110">
                          <Heart className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all available positions.</p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Browse All Jobs
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-bold text-gray-900">{offset + 1}</span> to{' '}
                      <span className="font-bold text-gray-900">{Math.min(offset + JOBS_PER_PAGE, totalJobs || 0)}</span> of{' '}
                      <span className="font-bold text-gray-900">{totalJobs}</span> results
                    </div>

                    <div className="flex items-center space-x-2">
                      {currentPage > 1 && (
                        <Link
                          href={createPageUrl(currentPage - 1)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-200 hover:shadow-md"
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
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${pageNum === currentPage
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white hover:text-gray-900 hover:shadow-md'
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
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-200 hover:shadow-md"
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
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}