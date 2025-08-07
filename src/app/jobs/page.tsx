// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Hero from '@/components/NavBar';
import React from 'react';
import { Search, MapPin, DollarSign, Calendar, ChevronLeft, ChevronRight, Filter, Heart, ChevronDown, ChevronUp } from 'lucide-react';

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

  let countQuery = supabase.from('job_listings_db').select('*', { count: 'exact', head: true });

  if (q) {
    countQuery = countQuery.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }
  if (location) {
    countQuery = countQuery.or(
      `Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`
    );
  }
  if (jobType) {
    countQuery = countQuery.eq('JobType', jobType);
  }
  if (workType) {
    if (workType === 'Remote') {
      countQuery = countQuery.eq('is_remote', true);
    } else if (workType === 'On-site') {
      countQuery = countQuery.eq('is_remote', false);
    }
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
  if (jobType) {
    query = query.eq('JobType', jobType);
  }
  if (workType) {
    if (workType === 'Remote') {
      query = query.eq('is_remote', true);
    } else if (workType === 'On-site') {
      query = query.eq('is_remote', false);
    }
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

  // DC region locations and other filter options
  const locations = [
    'Washington, D.C.',
    'Alexandria, VA', 
    'Arlington, VA',
    'Remote',
    'New York, NY',
    'San Francisco, CA',
    'Los Angeles, CA',
    'Chicago, IL',
    'Boston, MA'
  ];
  
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
  const workTypes = ['Remote', 'Hybrid', 'On-site'];

  // FilterSection Component for collapsible filters
  const FilterSection = ({ 
    title, 
    items, 
    selectedItem, 
    filterType, 
    createFilterUrl, 
    showCheckbox = false, 
    isLast = false 
  }: {
    title: string;
    items: string[];
    selectedItem?: string;
    filterType: string;
    createFilterUrl: (type: string, value: string) => string;
    showCheckbox?: boolean;
    isLast?: boolean;
  }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
      <div className={isLast ? "mb-6" : "mb-8"}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full font-bold text-gray-900 mb-4 hover:text-gray-700 transition-colors"
        >
          {title}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isOpen && (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item}
                href={createFilterUrl(filterType, item)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  selectedItem === item
                    ? 'bg-[#31C7FF] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {showCheckbox && (
                  <div className={`w-4 h-4 rounded border-2 mr-3 ${
                    selectedItem === item
                      ? 'bg-white border-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedItem === item && (
                      <div className="w-2 h-2 bg-[#31C7FF] rounded-sm m-0.5"></div>
                    )}
                  </div>
                )}
                {item}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        {/* Search Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center">
              <div className="flex-1 max-w-2xl">
                <div className="relative flex">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <form method="GET" action="/jobs" className="flex">
                      <input
                        type="text"
                        name="q"
                        defaultValue={q || ''}
                        placeholder="Job title or keyword"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700"
                      />
                      <input
                        type="text"
                        name="location"
                        defaultValue={location || ''}
                        placeholder="Location"
                        className="w-64 px-4 py-3 border-t border-r border-b border-gray-300 focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700"
                      />
                      {/* Hidden inputs to preserve other filters */}
                      {jobType && <input type="hidden" name="jobType" value={jobType} />}
                      {workType && <input type="hidden" name="workType" value={workType} />}
                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#31C7FF] hover:bg-[#28B4E6] text-white font-medium rounded-r-lg transition-colors duration-200"
                      >
                        Find Jobs
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Show By
                  </h2>
                  {(location || jobType || workType) && (
                    <Link
                      href={clearFilters()}
                      className="text-sm text-[#31C7FF] hover:text-[#28B4E6] font-medium"
                    >
                      Delete All
                    </Link>
                  )}
                </div>

                {/* Location Filter */}
                <FilterSection 
                  title="Location" 
                  items={locations} 
                  selectedItem={location}
                  filterType="location"
                  createFilterUrl={createFilterUrl}
                />

                {/* Job Type Filter */}
                <FilterSection 
                  title="Job Type" 
                  items={jobTypes} 
                  selectedItem={jobType}
                  filterType="jobType"
                  createFilterUrl={createFilterUrl}
                  showCheckbox={true}
                />

                {/* Work Type Filter */}
                <FilterSection 
                  title="Work Type" 
                  items={workTypes} 
                  selectedItem={workType}
                  filterType="workType"
                  createFilterUrl={createFilterUrl}
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#31C7FF] text-white">
                        Location: {location}
                        <Link href={createFilterUrl('location', '')} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                          ×
                        </Link>
                      </span>
                    )}
                    {jobType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#31C7FF] text-white">
                        {jobType}
                        <Link href={createFilterUrl('jobType', '')} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                          ×
                        </Link>
                      </span>
                    )}
                    {workType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#31C7FF] text-white">
                        {workType}
                        <Link href={createFilterUrl('workType', '')} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                          ×
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Jobs Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">{totalJobs}</span> jobs found
                  {q && <span> for &quot;{q}&quot;</span>}
                </p>
              </div>

              {/* Jobs Grid */}
              {jobs && jobs.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {jobs.map((job: Job) => (
                    <div key={job.JobID} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            {job.CompanyLogo && (
                              <div className="flex-shrink-0">
                                <Image
                                  src={job.CompanyLogo}
                                  alt={`${job.Company} logo`}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link href={`/jobs/${job.slug}`}>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-[#31C7FF] transition-colors cursor-pointer mb-1">
                                  {job.JobTitle}
                                </h3>
                              </Link>
                              <p className="text-[#31C7FF] font-medium mb-2">{job.Company}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.Location}
                                </div>
                                {job.formatted_salary && (
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    <span className="font-bold">{job.formatted_salary}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Posted {formatDate(job.PostedDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                            {job.ShortDescription}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.JobType)}`}>
                                {job.JobType}
                              </span>
                              {job.is_remote && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  Remote
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="px-4 py-2 bg-[#31C7FF] hover:bg-[#28B4E6] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                        <button className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all available positions.</p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center px-6 py-3 bg-[#31C7FF] hover:bg-[#28B4E6] text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Browse All Jobs
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}