// src/components/JobsList.tsx - UPDATED WITH COMPANY LOGOS
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, DollarSign, ChevronLeft, ChevronRight, Clock, Heart, Building2, TrendingUp, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import SaveJobButton from '@/components/SaveJobButton'
import { Job, Company } from '@/types';

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
  const [companies, setCompanies] = useState<Company[]>([]);
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

  // Load companies data
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const companyData = await response.json();
          setCompanies(companyData);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    };

    loadCompanies();
  }, []);

  // Helper function to get company data for a job
  const getCompanyForJob = (job: Job): Company | undefined => {
    if (job.company_id) {
      return companies.find(c => c.id === job.company_id);
    }
    return companies.find(c => c.name === job.Company);
  };

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

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full_time':
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'freelance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-12'} flex-shrink-0`}>
          <div className="sticky top-8">
            {/* Toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title={sidebarOpen ? 'Collapse filters' : 'Expand filters'}
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>

            {sidebarOpen && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {(locationFilter || jobTypeFilter || workTypeFilter || searchQuery) && (
                    <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Search Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Job title, company..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </form>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <button onClick={() => toggleFilterSection('location')} className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3">
                    <span>Location</span>
                    {expandedFilters.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.location && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {locationOptions.map((location) => (
                        <label key={location} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={locationFilter === location}
                            onChange={() => handleLocationChange(location)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <button onClick={() => toggleFilterSection('jobType')} className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3">
                    <span>Job Type</span>
                    {expandedFilters.jobType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.jobType && (
                    <div className="space-y-2">
                      {jobTypeOptions.map((jobType) => (
                        <label key={jobType} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={jobTypeFilter === jobType}
                            onChange={() => handleJobTypeChange(jobType)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">{jobType}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Work Type Filter */}
                <div>
                  <button onClick={() => toggleFilterSection('workType')} className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3">
                    <span>Work Type</span>
                    {expandedFilters.workType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.workType && (
                    <div className="space-y-2">
                      {workTypeOptions.map((workType) => (
                        <label key={workType} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workTypeFilter === workType}
                            onChange={() => handleWorkTypeChange(workType)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">{workType}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Six-Figure Jobs</h1>

            {/* Active Filters */}
            {(locationFilter || jobTypeFilter || workTypeFilter) && (
              <div className="mb-6">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {locationFilter && (
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      📍 {locationFilter}
                      <button onClick={() => setLocationFilter('')} className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {jobTypeFilter && (
                    <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      💼 {jobTypeFilter}
                      <button onClick={() => setJobTypeFilter('')} className="ml-2 hover:bg-purple-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {workTypeFilter && (
                    <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      🏠 {workTypeFilter}
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

            {/* Jobs List - UPDATED TO TWO COLUMNS */}
            {!loading && jobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => {
                  const company = getCompanyForJob(job);

                  return (
                    <div key={job.JobID} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
                      {/* Save Button - Upper Right Float - Hidden on mobile, shown on larger screens */}
                      <div className="hidden sm:block absolute top-4 right-4">
                        <SaveJobButton
                          jobId={job.JobID}
                          variant="heart"
                          size="md"
                        />
                      </div>

                      {/* Company Logo, Company Name, and Job Title Row */}
                      <div className="flex items-start mb-4 sm:pr-16">
                        {/* Company Logo */}
                        {company?.company_logo ? (
                          <img
                            src={company.company_logo}
                            alt={`${company.name} logo`}
                            className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-2 bg-white mr-4 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <Building2 className="w-10 h-10 text-gray-400" />
                          </div>
                        )}

                        {/* Company Name and Job Title Column */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-600 font-medium block mb-1">
                            {job.Company}
                          </span>
                          <Link
                            href={`/jobs/${job.slug}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                          >
                            {job.JobTitle.replace(/\b\w+/g, (word) => {
                              // Keep certain tech abbreviations uppercase
                              const upperWords = ['IT', 'AI', 'ML', 'API', 'CEO', 'CTO', 'CFO', 'VP', 'HR', 'QA', 'DevOps', 'AWS', 'SaaS', 'B2B', 'B2C', 'UI', 'UX', 'SQL', 'PHP', 'CSS', 'HTML', 'JS', 'HTTP', 'HTTPS', 'REST', 'JSON', 'XML', 'CRM', 'ERP', 'SEO', 'SEM', 'PPC', 'ROI', 'KPI', 'LOB', 'SME', 'QC', 'R&D', 'P&L', 'M&A', 'IPO', 'B2G', 'G2B', 'G2C', 'C2C', 'P2P', 'IoT', 'AR', 'VR', 'EA'];
                              if (upperWords.includes(word.toUpperCase())) {
                                return word.toUpperCase();
                              }
                              // Otherwise use proper case
                              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                            })}
                          </Link>
                        </div>
                      </div>

                      {/* Location pin and Posted date with clock */}
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{job.Location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Posted {formatDate(job.PostedDate)}</span>
                        </div>
                      </div>

                      {/* Badges with line underneath */}
                      <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
                        {job.is_remote && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            Remote
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.JobType)}`}>
                          {job.JobType.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Salary and Buttons Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-green-600">{job.formatted_salary}</span>
                        </div>

                        {/* Mobile: Both buttons side by side, Desktop: Just Apply button */}
                        <div className="flex items-center space-x-2">
                          {/* Save button - Only shown on mobile */}
                          <div className="sm:hidden">
                            <SaveJobButton
                              jobId={job.JobID}
                              variant="heart"
                              size="sm"
                            />
                          </div>

                          <Link
                            href={`/jobs/${job.slug}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Apply
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p>Try adjusting your search criteria or clearing some filters.</p>
                  </div>
                </div>
              )
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
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
                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${pageNum === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
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