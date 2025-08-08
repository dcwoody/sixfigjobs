// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { loadJobData, loadCompanyData } from '@/lib/data';
import JobCard from '@/components/JobCard';

export default async function HomePage() {
  const jobs = await loadJobData();
  const companies = await loadCompanyData();
  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Find Your Dream Job</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover six-figure opportunities with top companies. Join thousands of professionals who've found their perfect career match.
            </p>
            
            {/* Search CTA */}
            <Link href="/jobs">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg">
                Browse All Jobs
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{jobs.length}</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{companies.length}</div>
            <div className="text-gray-600">Partner Companies</div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">$150K+</div>
            <div className="text-gray-600">Average Salary</div>
          </div>
        </div>
      </div>

      {/* Featured Jobs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard key={job.JobID} job={job} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/jobs">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              View All Jobs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}