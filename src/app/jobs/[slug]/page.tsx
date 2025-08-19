// src/app/jobs/[slug]/page.tsx - UPDATED VERSION WITH SIDEBAR
import JobCard from '@/components/JobCard';
import SaveJobButton from '@/components/SaveJobButton';
import ShareJobButton from '@/components/ShareJobButton';
import ReportJobButton from '@/components/ReportJobButton';

import React from 'react';
import Link from 'next/link';
import Footer from "@/components/Footer"

import { notFound } from 'next/navigation';
import { MapPin, DollarSign, Briefcase, Calendar, Star, ExternalLink, Share2, Flag, Building } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
          <span>/</span>
          <span className="text-gray-900">{job.JobTitle}</span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Job Content */}
          <div className="lg:col-span-2">

            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {/* Helper function to properly capitalize job titles */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {job.JobTitle.replace(/\b\w+/g, (word) => {
                        // Keep certain abbreviations uppercase
                        const upperWords = ['UX', 'UI', 'IT', 'AI', 'ML', 'API', 'CEO', 'CTO', 'CFO', 'VP', 'HR', 'QA', 'DevOps', 'AWS', 'SaaS', 'B2B', 'B2C'];
                        if (upperWords.includes(word.toUpperCase())) {
                          return word.toUpperCase();
                        }
                        // Otherwise use proper case
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                      })}
                    </h1>

                    {/* Company with logo */}
                    <div className="flex items-center space-x-4 text-lg mb-2">
                      {company ? (
                        company.slug && company.slug !== '' && !/[\[\](){}]/.test(company.slug) ? (
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
                          <div className="text-gray-700 font-semibold flex items-center">
                            {/* SHOW COMPANY LOGO IF AVAILABLE */}
                            {company.company_logo && (
                              <img
                                src={company.company_logo}
                                alt={`${company.name} logo`}
                                className="w-8 h-8 object-contain mr-2 border border-gray-200 rounded"
                              />
                            )}
                            {company.name}
                          </div>
                        )
                      ) : (
                        <span className="text-gray-700 font-semibold">{job.Company}</span>
                      )}
                      {job.is_remote && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Remote
                          </span>
                        </>
                      )}
                    </div>

                    {/* Location below company */}
                    <div className="flex items-center text-gray-600 text-base">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.Location}
                    </div>
                  </div>

                  {/* Save Button & Apply Button - Upper Right */}
                  <div className="ml-6 flex items-center space-x-3">
                    <div className="scale-125 pr-4">
                      <SaveJobButton jobId={job.JobID} />
                    </div>
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                      Apply Now <ExternalLink className="h-5 w-5 ml-2" />
                    </a>
                  </div>
                </div>

                {/* 1x3 Grid with Color-Coded Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Salary - Green */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-sm text-green-600 font-medium">Salary</div>
                    </div>
                    <div className="font-bold text-green-900">
                      {job.formatted_salary || 'Competitive'}
                    </div>
                  </div>

                  {/* Job Type - Light Blue */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Job Type</div>
                    </div>
                    <div className="font-bold text-blue-900">{job.JobType.replace('_', ' ')}</div>
                  </div>

                  {/* Posted - Grey */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Posted</div>
                    </div>
                    <div className="font-bold text-gray-900">{formatDate(job.PostedDate)}</div>
                  </div>
                </div>

                {/* No Apply Button here anymore - moved to upper right */}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: job.LongDescription }}
              />
            </div>

            {/* Similar Jobs - 1x3 Grid (keeping your version) */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarJobs.map((similarJob) => (
                    <div key={similarJob.JobID} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="space-y-4">
                        <Link href={`/jobs/${similarJob.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
                            {similarJob.JobTitle.replace(/\b\w+/g, (word) => {
                              const upperWords = ['UX', 'UI', 'IT', 'AI', 'ML', 'API', 'CEO', 'CTO', 'CFO', 'VP', 'HR', 'QA', 'DevOps', 'AWS', 'SaaS', 'B2B', 'B2C'];
                              if (upperWords.includes(word.toUpperCase())) {
                                return word.toUpperCase();
                              }
                              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                            })}
                          </h3>
                        </Link>

                        <div className="flex text-sm text-gray-600 font-small">
                          <Building className="h-4 w-4 mr-1" />
                          {similarJob.Company}
                        </div>

                        {similarJob.formatted_salary && (
                          <div className="flex items-center text-sm text-green-600 font-medium">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {similarJob.formatted_salary}
                          </div>
                        )}

                        {similarJob.is_remote && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs w-fit">
                            Remote
                          </span>
                        )}

                        <div className="flex items-center text-sm text-gray-600 font-medium">
                          <MapPin className="h-4 w-4 mr-1" />
                          {similarJob.Location}
                        </div>

                        <Link
                          href={`/jobs/${similarJob.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">

              {/* Company Details */}
              {company && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Company Details
                  </h3>

                  <div className="space-y-4">
                    {/* Company Logo and Name */}
                    <div className="flex items-center space-x-4">
                      {company.company_logo && (
                        <img
                          src={company.company_logo}
                          alt={`${company.name} logo`}
                          className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-2"
                        />
                      )}
                      <div>
                        {company.slug && company.slug !== '' && !/[\[\](){}]/.test(company.slug) ? (
                          <Link href={`/companies/${company.slug}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                            {company.name}
                          </Link>
                        ) : (
                          <span className="text-gray-700 font-semibold">{company.name}</span>
                        )}
                        <p className="text-sm text-gray-600">{company.industry}</p>
                      </div>
                    </div>

                    {/* Company Stats and Rating */}
                    <div className="space-y-3 text-sm">
                      {company.overall_rating && (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(company.overall_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{company.overall_rating}</span>
                          </div>
                          <div className="text-xs text-gray-500">Glassdoor overall rating</div>
                        </div>
                      )}

                      {company.size && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company Size:</span>
                          <span className="font-medium">{company.size}</span>
                        </div>
                      )}
                      {company.year_founded && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Founded:</span>
                          <span className="font-medium">{company.year_founded}</span>
                        </div>
                      )}
                      {company.headquarters && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Headquarters:</span>
                          <span className="font-medium">{company.headquarters}</span>
                        </div>
                      )}
                    </div>

                    {/* Company Description */}
                    {company.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">About</h4>
                        <p className="text-sm text-gray-600 line-clamp-4">{company.description}</p>
                      </div>
                    )}

                    {/* View Company Profile Button */}
                    {company.slug && company.slug !== '' && !/[\[\](){}]/.test(company.slug) ? (
                      <Link 
                        href={`/companies/${company.slug}`}
                        className="block w-full text-center bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        View Company Profile
                      </Link>
                    ) : (
                      <div className="block w-full text-center bg-gray-50 text-gray-400 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed">
                        Company Profile Unavailable
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Share and Report Actions - NOW FUNCTIONAL */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {/* Share Button */}
                  <ShareJobButton jobTitle={job.JobTitle} companyName={job.Company} />

                  {/* Report Button */}
                  <ReportJobButton jobTitle={job.JobTitle} companyName={job.Company} />
                </div>
              </div>

              {/* Additional Company Info */}
              {company?.website && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Company Website
                    </a>
                    {company.wikipedia_url && (
                      <a
                        href={company.wikipedia_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Wikipedia
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}