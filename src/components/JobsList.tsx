// src/components/JobsList.tsx - Client Component for Interactivity
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, DollarSign, ChevronLeft, ChevronRight, Clock, Heart, Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  const searchParams = useSearchParams();
  
  // State management
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState(initialJobs.length);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '');
  const [locationFilter, setLocationFilter] = useState(initialSearchParams.location || '');
  const [workTypeFilter, setWorkTypeFilter] = useState(initialSearchParams.workType || '');
  const [currentPage, setCurrentPage] = useState(parseInt(initialSearchParams.page || '1', 10));

  // Load jobs based on filters
  const loadJobs = async (filters: any = {}) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('job_listings_db')
        .select('*')
        .order('PostedDate', { ascending: false });

      // Apply filters
      if (filters.q) {
        query = query.or(`JobTitle.ilike.%${filters.q}%,ShortDescription.ilike.%${filters.q}%,Company.ilike.%${filters.q}%`);
      }

      if (filters.location) {
        query = query.ilike('Location', `%${filters.location}%`);
        if (filters.location.toLowerCase().includes('remote')) {
          query = query.eq('is_remote', true);
        }
      }

      if (filters.workType === 'Remote') {
        query = query.eq('is_remote', true);
      } else if (filters.workType === 'On-site') {
        query = query.eq('is_remote', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading jobs:', error);
        return;
      }

      setJobs(data || []);
      setFilteredJobs(data || []);
      setTotalJobs(data?.length || 0);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error in loadJobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters = {
      q: searchQuery,
      location: locationFilter,
      workType: workTypeFilter
    };

    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationFilter) params.set('location', locationFilter);
    if (workTypeFilter) params.set('workType', workTypeFilter);
    
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
    
    // Load filtered data
    await loadJobs(filters);
  };

  // Pagination
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

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

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full-time':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'part-time':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'contract':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Opportunities</h1>
          
          {/* Real-time Search Form */}
          <form onSubmit={handleSearch} className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, companies..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Work Types</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Jobs Count */}
        <div className="mb-6">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-gray-700">
              <span className="font-bold text-gray-900 text-xl">{totalJobs}</span>
              <span className="ml-1">jobs found</span>
              {searchQuery && <span className="text-blue-600 font-medium"> for "{searchQuery}"</span>}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Jobs List */}
        {!loading && currentJobs.length > 0 ? (
          <div className="space-y-6 mb-8">
            {currentJobs.map((job: Job) => (
              <div
                key={job.JobID}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Company Initial */}
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {job.Company.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 font-medium text-sm">
                            {job.Company}
                          </span>
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

                    <p className="text-gray-600 leading-relaxed mb-4">
                      {job.ShortDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Details
                      </Link>
                      
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('');
                setWorkTypeFilter('');
                loadJobs({});
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Show All Jobs
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}