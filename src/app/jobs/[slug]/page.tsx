// src/app/jobs/[slug]/page.tsx
import JobCard from '@/components/JobCard';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, DollarSign, Briefcase, Calendar, Star, Heart, ExternalLink } from 'lucide-react';
import { loadJobData, loadCompanyData, formatDate } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  console.log('🔍 Looking for job with slug:', slug);
  
  const jobs = await loadJobData();
  const companies = await loadCompanyData();
  
  console.log('🔍 Total jobs loaded:', jobs.length);
  console.log('🔍 Available slugs:', jobs.map(j => j.slug));
  
  const job = jobs.find(j => j.slug === slug);
  
  console.log('🔍 Found job:', job ? 'YES' : 'NO');
  if (job) {
    console.log('🔍 Job title:', job.JobTitle);
  } else {
    console.log('❌ Job not found for slug:', slug);
    console.log('❌ Available slugs in data:', jobs.slice(0, 5).map(j => ({ title: j.JobTitle, slug: j.slug })));
  }
  
  if (!job) notFound();
  
  const company = companies.find(c => c.name === job.Company);
  const similarJobs = jobs.filter(j => 
    j.JobID !== job.JobID && 
    (j.Company === job.Company || j.JobType === job.JobType)
  ).slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
          <span>/</span>
          <span className="text-gray-900">{job.JobTitle}</span>
        </nav>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.JobTitle}</h1>
              <div className="flex items-center space-x-4 text-lg">
                {company ? (
                  <Link href={`/companies/${company.slug}`} className="text-blue-600 font-semibold hover:underline">
                    {job.Company}
                  </Link>
                ) : (
                  <span className="text-blue-600 font-semibold">{job.Company}</span>
                )}
                {company?.overall_rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{company.overall_rating}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="h-6 w-6" />
            </button>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-medium">{job.Location}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Salary</div>
                <div className="font-medium">{job.formatted_salary}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Job Type</div>
                <div className="font-medium">{job.JobType.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          {/* Apply Section */}
          <div className="flex items-center space-x-4">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              Apply Now <ExternalLink className="h-5 w-5 ml-2" />
            </a>
            {job.is_remote && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                Remote Position
              </span>
            )}
            <span className="text-gray-600">
              Posted {formatDate(job.PostedDate)}
            </span>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <div className="text-gray-700 mb-6">{job.ShortDescription}</div>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {job.LongDescription}
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        {company && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {company.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 mb-4">{company.description}</p>
                <Link 
                  href={`/companies/${company.slug}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  View Company Profile →
                </Link>
              </div>
              <div>
                {company.company_logo && (
                  <img
                    src={company.company_logo}
                    alt={`${company.name} logo`}
                    className="w-32 h-32 object-contain mb-4 border border-gray-200 rounded-lg p-4"
                  />
                )}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{company.overall_rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
            <div className="space-y-4">
              {similarJobs.map((similarJob) => (
                <JobCard key={similarJob.JobID} job={similarJob} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}