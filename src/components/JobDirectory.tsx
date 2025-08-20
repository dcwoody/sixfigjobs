// src/components/JobDirectory.tsx - Client Component
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Filter, Clock, DollarSign, Building } from 'lucide-react';

interface Job {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  slug: string;
  ShortDescription: string;
  PostedDate: string;
  is_remote: boolean;
  JobType: string;
  company_id?: string;
}

interface Job {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  slug: string;
  ShortDescription: string;
  PostedDate: string;
  is_remote: boolean;
  JobType: string;
  company_id?: string;
}

interface JobDirectoryProps {
  initialJobs: Job[];
}

export default function JobDirectory({ initialJobs }: JobDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workType, setWorkType] = useState(searchParams.get('workType') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const JOBS_PER_PAGE = 12;

  // Debounced search function
  const debounceSearch = useCallback(
    debounce(async (query: string, loc: string, type: string, work: string) => {
      await fetchJobs(query, loc, type, work, 1, true);
    }, 300),
    []
  );

  // Fetch jobs from API
  const fetchJobs = async (
    q: string = searchQuery,
    loc: string = location,
    type: string = jobType,
    work: string = workType,
    page: number = currentPage,
    reset: boolean = false
  ) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (loc) params.set('location', loc);
      if (type) params.set('jobType', type);
      if (work) params.set('workType', work);
      params.set('page', page.toString());
      params.set('limit', JOBS_PER_PAGE.toString());

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        if (reset || page === 1) {
          setJobs(data.data);
        } else {
          setJobs(prev => [...prev, ...data.data]);
        }
        
        setTotalJobs(data.total);
        setCurrentPage(page);
        setHasMore(data.data.length === JOBS_PER_PAGE);

        // Update URL without page reload
        const newParams = new URLSearchParams();
        if (q) newParams.set('q', q);
        if (loc) newParams.set('location', loc);
        if (type) newParams.set('jobType', type);
        if (work) newParams.set('workType', work);
        
        const newUrl = newParams.toString() ? 
          `${window.location.pathname}?${newParams}` : 
          window.location.pathname;
          
        window.history.replaceState({}, '', newUrl);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    if (searchQuery !== searchParams.get('q') || 
        location !== searchParams.get('location') ||
        jobType !== searchParams.get('jobType') ||
        workType !== searchParams.get('workType')) {
      debounceSearch(searchQuery, location, jobType, workType);
    }
  }, [searchQuery, location, jobType, workType, debounceSearch]);

  // Load more jobs
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(searchQuery, location, jobType, workType, currentPage + 1, false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title, company, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location or 'Remote'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Job Type Filter */}
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>

            {/* Work Type Filter */}
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Work Types</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          {totalJobs > 0 ? `${totalJobs.toLocaleString()} jobs found` : 'No jobs found'}
          {(searchQuery || location || jobType || workType) && (
            <span className="ml-2">
              for your search criteria
            </span>
          )}
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {jobs.map((job) => (
          <div key={job.JobID} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Company and Remote Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{job.Company}</span>
                </div>
                {job.is_remote && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Remote
                  </span>
                )}
              </div>

              {/* Job Title */}
              <Link href={`/jobs/${job.slug}`} className="block">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                  {job.JobTitle}
                </h3>
              </Link>

              {/* Location and Salary */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{job.Location}</span>
                </div>
                {job.formatted_salary && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-sm">{job.formatted_salary}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {job.ShortDescription}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-xs">{formatDate(job.PostedDate)}</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {job.JobType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading jobs...</span>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && jobs.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More Jobs
          </button>
        </div>
      )}

      {/* No More Jobs */}
      {!loading && !hasMore && jobs.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          <p>You've seen all available jobs</p>
        </div>
      )}

      {/* No Results */}
      {!loading && jobs.length === 0 && totalJobs === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all jobs without filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}