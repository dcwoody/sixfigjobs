// src/components/JobsList.tsx - API-based version
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, DollarSign, ChevronLeft, ChevronRight, Clock, Heart, Building2, TrendingUp, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types';

interface JobsListProps {
  initialJobs: Job[];
  initialSearchParams: {
    q?: string;
    location?: string;
    page?: string;
    jobType?: string;
    workType?: string;
  };
}

const JOBS_PER_PAGE = 12;

export default function JobsList({ initialJobs, initialSearchParams }: JobsListProps) {
  const router = useRouter();
  
  // State management
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '');
  const [locationFilter, setLocationFilter] = useState(initialSearchParams.location || '');
  const [jobTypeFilter, setJobTypeFilter] = useState(initialSearchParams.jobType || '');
  const [workTypeFilter, setWorkTypeFilter] = useState(initialSearchParams.workType || '');
  const [currentPage, setCurrentPage] = useState(parseInt(initialSearchParams.page || '1', 10));

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({
    location: true,
    jobType: true,
    workType: true
  });

  // Filter options
  const locationOptions = [
    'Washington, DC', 'Arlington, VA', 'Alexandria, VA', 'Bethesda, MD',
    'Silver Spring, MD', 'Rockville, MD', 'Fairfax, VA', 'Tysons, VA',
    'Reston, VA', 'Remote'
  ];

  const jobTypeOptions = ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship'];
  const workTypeOptions = ['Remote', 'Hybrid', 'On-site'];

  // Load jobs from API
  const loadJobs = async (page = 1) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (locationFilter) params.set('location', locationFilter);
      if (jobTypeFilter) params.set('jobType', jobTypeFilter);
      if (workTypeFilter) params.set('workType', workTypeFilter);
      params.set('page', page.toString());
      params.set('limit', JOBS_PER_PAGE.toString());

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
        setTotalJobs(data.totalJobs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL and load jobs
  const updateFiltersAndLoad = async (page = 1) => {
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationFilter) params.set('location', locationFilter);
    if (jobTypeFilter) params.set('jobType', jobTypeFilter);
    if (workTypeFilter) params.set('workType', workTypeFilter);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    
    // Load filtered jobs
    await loadJobs(page);
  };

  // Auto-apply filters when they change
  useEffect(() => {
    updateFiltersAndLoad(1);
  }, [locationFilter, jobTypeFilter, workTypeFilter]);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFiltersAndLoad(1);
  };

  // Filter change handlers
  const handleLocationChange = (location: string) => {
    setLocationFilter(location === locationFilter ? '' : location);
  };

  const handleJobTypeChange = (jobType: string) => {
    setJobTypeFilter(jobType === jobTypeFilter ? '' : jobType);
  };

  const handleWorkTypeChange = (workType: string) => {
    setWorkTypeFilter(workType === workTypeFilter ? '' : workType);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocationFilter('');
    setJobTypeFilter('');
    setWorkTypeFilter('');
    setSearchQuery('');
    router.push('/jobs');
    loadJobs(1);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateFiltersAndLoad(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle filter sections
  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

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
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full-time': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'part-time': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'contract': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'temporary': return 'bg-orange-100 text-orange-700 border border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const activeFiltersCount = [locationFilter, jobTypeFilter, workTypeFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - same as before */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
              <p className="text-gray-600 mt-1">Discover your next six-figure career opportunity</p>
            </div>
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, companies, keywords..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Jobs'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - same filter structure as before */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Clear All
                  </button>
                )}
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilterSection('location')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Location</span>
                  {expandedFilters.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.location && (
                  <div className="space-y-2">
                    {locationOptions.map((location) => (
                      <label key={location} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="location"
                          value={location}
                          checked={locationFilter === location}
                          onChange={() => handleLocationChange(location)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Type & Work Type filters - same structure */}
              <div className="mb-6">
                <button
                  onClick={() => toggleFilterSection('jobType')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Job Type</span>
                  {expandedFilters.jobType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.jobType && (
                  <div className="space-y-2">
                    {jobTypeOptions.map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="jobType"
                          value={type}
                          checked={jobTypeFilter === type}
                          onChange={() => handleJobTypeChange(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <button
                  onClick={() => toggleFilterSection('workType')}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Work Type</span>
                  {expandedFilters.workType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.workType && (
                  <div className="space-y-2">
                    {workTypeOptions.map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="workType"
                          value={type}
                          checked={workTypeFilter === type}
                          onChange={() => handleWorkTypeChange(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1">
            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                  {locationFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Location: {locationFilter}
                      <button onClick={() => setLocationFilter('')} className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {jobTypeFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Type: {jobTypeFilter}
                      <button onClick={() => setJobTypeFilter('')} className="ml-2 hover:bg-purple-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {workTypeFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Work: {workTypeFilter}
                      <button onClick={() => setWorkTypeFilter('')} className="ml-2 hover:bg-green-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Jobs Count */}
            <div className="mb-6">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-gray-700">
                  <span className="font-bold text-gray-900 text-xl">{totalJobs.toLocaleString()}</span>
                  <span className="ml-1">jobs found</span>
                  {searchQuery && <span className="text-blue-600 font-medium"> for "{searchQuery}"</span>}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            )}

            {/* Jobs List */}
            {!loading && jobs.length > 0 ? (
              <div className="space-y-6 mb-8">
                {jobs.map((job: Job) => (
                  <div key={job.JobID} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {job.Company.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 font-medium text-sm">{job.Company}</span>
                        </div>

                        <Link href={`/jobs/${job.slug}`}>
                          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                            {job.JobTitle}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.Location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(job.PostedDate)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center text-green-600 font-bold text-lg mb-2">
                          <DollarSign className="w-5 h-5" />
                          {job.formatted_salary || 'Competitive'}
                        </div>
                        
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.JobType)}`}>
                            {job.JobType}
                          </span>
                          {job.is_remote && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-4">{job.ShortDescription}</p>

                    <div className="flex items-center justify-between">
                      <Link href={`/jobs/${job.slug}`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        View Details
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                <button onClick={clearAllFilters} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Show All Jobs
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * JOBS_PER_PAGE) + 1}-{Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs.toLocaleString()} jobs
                  </div>

                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <button onClick={() => handlePageChange(currentPage - 1)} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, currentPage - 2) + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                              pageNum === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {currentPage < totalPages && (
                      <button onClick={() => handlePageChange(currentPage + 1)} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}