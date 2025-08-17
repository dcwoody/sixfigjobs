// src/app/jobs/[slug]/page.tsx - UPDATED VERSION
import JobCard from '@/components/JobCard';
import SaveJobButton from '@/components/SaveJobButton';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, DollarSign, Briefcase, Calendar, Star, ExternalLink } from 'lucide-react';
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
    console.log('🔍 Job company_id:', job.company_id);
  } else {
    console.log('❌ Job not found for slug:', slug);
    console.log('❌ Available slugs in data:', jobs.slice(0, 5).map(j => ({ title: j.JobTitle, slug: j.slug })));
  }
  
  if (!job) notFound();
  
  // UPDATED: Use company_id instead of company name matching
  const company = job.company_id 
    ? companies.find(c => c.id === job.company_id)
    : companies.find(c => c.name === job.Company); // Fallback for jobs without company_id
  
  console.log('🏢 Found company:', company ? company.name : 'NO COMPANY FOUND');
  if (company) {
    console.log('🏢 Company logo:', company.company_logo || 'NO LOGO');
  }
  
  const similarJobs = jobs.filter(j => 
    j.JobID !== job.JobID && 
    (j.company_id === job.company_id || j.JobType === job.JobType)
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
                  <Link 
                    href={`/companies/${company.slug}`} 
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                  >
                    {/* SHOW COMPANY LOGO IF AVAILABLE */}
                    {company.company_logo && (
                      <img
                        src={company.company_logo}
                        alt={`${company.name} logo`}
                        className="w-8 h-8 object-contain mr-2 border border-gray-200 rounded"
                      />
                    )}
                    {company.name}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-semibold">{job.Company}</span>
                )}
                <span className="text-gray-500">•</span>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-1" />
                  {job.Location}
                </div>
                {job.is_remote && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Remote
                    </span>
                  </>
                )}
              </div>
              
              {job.formatted_salary && (
                <div className="mt-4">
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-lg">
                    {job.formatted_salary}
                  </span>
                </div>
              )}
            </div>
            <SaveJobButton jobId={job.JobID} />
          </div>

          {/* Job Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Posted</div>
                <div className="font-medium">{formatDate(job.PostedDate)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-medium">{job.Location}</div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-6 border-t border-gray-200">
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
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About {company.name}</h2>
            <div className="flex items-start space-x-6">
              {/* COMPANY LOGO - BIGGER VERSION */}
              {company.company_logo && (
                <img
                  src={company.company_logo}
                  alt={`${company.name} logo`}
                  className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-3"
                />
              )}
              <div className="flex-1">
                <p className="text-gray-700 mb-4">{company.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Industry</div>
                    <div className="font-medium">{company.industry}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Company Size</div>
                    <div className="font-medium">{company.size}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Founded</div>
                    <div className="font-medium">{company.year_founded}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/companies/${company.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View Company Profile <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-1 gap-6">
              {similarJobs.map((similarJob) => (
                <div key={similarJob.JobID} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/jobs/${similarJob.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                          {similarJob.JobTitle}
                        </h3>
                      </Link>
                      <p className="text-blue-600 font-medium mb-1">{similarJob.Company}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {similarJob.Location}
                        </div>
                        {similarJob.formatted_salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {similarJob.formatted_salary}
                          </div>
                        )}
                        {similarJob.is_remote && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Remote
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{similarJob.ShortDescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}