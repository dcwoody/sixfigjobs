// src/app/jobs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Job } from '@/types';
import JobCard from '@/components/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const locations = ['Washington DC', 'Alexandria, VA', 'Arlington, VA', 'Maryland', 'Remote'];

  useEffect(() => {
    // Load job data (in real app, this would be an API call)
    const loadData = async () => {
      const response = await fetch('/data/job_listings_db.csv');
      const csvText = await response.text();
      
      // You'll need to install papa parse: npm install papaparse @types/papaparse
      const Papa = require('papaparse');
      const result = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      const sortedJobs = result.data.sort((a: Job, b: Job) => 
        new Date(b.PostedDate).getTime() - new Date(a.PostedDate).getTime()
      );
      
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.JobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.Company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.ShortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (locationFilter) {
      if (locationFilter === 'Remote') {
        filtered = filtered.filter(job => job.is_remote);
      } else {
        filtered = filtered.filter(job => 
          job.Location.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchQuery, locationFilter, jobs]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <p className="text-gray-600">{filteredJobs.length} jobs found • Sorted by newest first</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4 mb-8">
          {currentJobs.map((job) => (
            <JobCard key={job.JobID} job={job} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}