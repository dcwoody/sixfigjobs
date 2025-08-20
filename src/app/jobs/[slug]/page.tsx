// src/app/jobs/[slug]/page.tsx - UPDATED VERSION WITH SIDEBAR
import JobCard from '@/components/JobCard';
import SaveJobButton from '@/components/SaveJobButton';
import ShareJobButton from '@/components/ShareJobButton';
import ReportJobButton from '@/components/ReportJobButton';

import React from 'react';
import Link from 'next/link';
import Footer from "@/components/Footer"

import { notFound } from 'next/navigation';
import { MapPin, Banknote, Briefcase, Calendar, Star, ExternalLink, Share2, Flag, Building } from 'lucide-react';
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

  // Function to format job descriptions - add this above your component or in a utils file
  const formatJobDescription = (description: string): string => {
    if (!description) return '';

    // Check if the description already has HTML tags
    const hasHTML = /<[a-z][\s\S]*>/i.test(description);

    if (hasHTML) {
      // Already has HTML formatting, just clean it up
      return description
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\s*)+/gs, '<ul>$&</ul>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<ul>.*<\/ul>)<\/p>/gs, '$1');
    }

    // Plain text - needs formatting
    return description
      // First, escape any existing HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

      // Handle section headers (lines that end with a colon and are followed by content)
      .replace(/^([A-Z][^:\n]*:)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')

      // Handle bulleted lists (lines starting with bullet points or dashes)
      .replace(/^[•\-\*]\s*(.+)$/gm, '<li>$1</li>')

      // Handle numbered lists
      .replace(/^\d+\.\s*(.+)$/gm, '<li>$1</li>')

      // Wrap consecutive list items in ul tags
      .replace(/(<li>.*?<\/li>\s*)+/gs, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>')

      // Handle bold text (words in all caps that aren't common words)
      .replace(/\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/g, (match) => {
        // Don't make common words like "AND", "OR", "THE" bold
        const commonWords = ['AND', 'OR', 'THE', 'FOR', 'WITH', 'FROM', 'TO', 'IN', 'ON', 'AT', 'BY', 'AS', 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'COULD', 'SHOULD', 'MAY', 'MIGHT', 'CAN', 'SHALL'];
        if (commonWords.includes(match.trim())) {
          return match.toLowerCase();
        }
        return `<strong>${match}</strong>`;
      })

      // Split into paragraphs based on double line breaks or logical breaks
      .split(/\n\s*\n|\. (?=[A-Z][^.]*(?:Responsibilities|Qualifications|Requirements|Experience|Skills|About|What|Who|Why|How):)/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Don't wrap headers in p tags
        if (paragraph.includes('<h3>') || paragraph.includes('<ul>')) {
          return paragraph;
        }
        return `<p class="mb-4 leading-relaxed">${paragraph}</p>`;
      })
      .join('')

      // Clean up any double spaces or extra whitespace
      .replace(/\s+/g, ' ')
      .replace(/\s*<\/li>\s*/g, '</li>')
      .replace(/\s*<li>\s*/g, '<li>')

      // Ensure proper spacing around headers
      .replace(/<\/h3>\s*<p>/g, '</h3><p>')
      .replace(/<\/p>\s*<h3>/g, '</p><h3>');
  };

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
                    {/* Company Logo and Name Row */}
                    <div className="flex items-center mb-3">
                      {/* Company Logo */}
                      {company?.company_logo ? (
                        <img
                          src={company.company_logo}
                          alt={`${company.name} logo`}
                          className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2 bg-white mr-4 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <Building className="w-10 h-10 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        {/* Company name and Job Title */}
                        <div className="">
                          {company ? (
                            company.slug && company.slug !== '' && !/[\[\](){}]/.test(company.slug) ? (
                              <Link
                                href={`/companies/${company.slug}`}
                                className="text-lg text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                              >
                                {job.Company}
                              </Link>
                            ) : (
                              <span className="text-lg text-blue-600 font-semibold">
                                {job.Company}
                              </span>
                            )
                          ) : (
                            <span className="text-lg text-blue-600 font-semibold">
                              {job.Company}
                            </span>
                          )}
                        </div>

                        {/* Job Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                          {job.JobTitle.replace(/\b\w+/g, (word) => {
                            // Keep certain abbreviations uppercase
                            const upperWords = ['UX', 'UI', 'IT', 'AI', 'ML', 'API', 'CEO', 'CTO', 'CFO', 'VP', 'HR', 'QA', 'DevOps', 'AWS', 'SaaS', 'B2B', 'B2C', 'EA'];
                            if (upperWords.includes(word.toUpperCase())) {
                              return word.toUpperCase();
                            }
                            // Otherwise use proper case
                            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                          })}
                        </h1>

                        {/* Location below job title */}
                        <div className="flex items-center text-gray-600 text-base">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.Location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button - Upper Right */}
                  <div className="ml-6">
                    <SaveJobButton jobId={job.JobID} variant="heart" size="lg" />
                  </div>
                </div>

                {/* 1x3 Grid with Color-Coded Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Salary - Green */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Banknote className="h-5 w-5 text-green-600" />
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

              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                {job.ShortDescription && (
                  <div className="text-gray-700 mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                    <p className="leading-relaxed">{job.ShortDescription}</p>
                  </div>
                )}
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: formatJobDescription(job.LongDescription)
                  }}
                />
              </div>

              <div>

                <hr className="h-px my-4 border-1 border-gray-300"></hr>

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
                            <Banknote className="h-4 w-4 mr-1" />
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
                      </div>
                    </div>

                    {/* Company Stats and Rating */}
                    <div className="space-y-3 text-sm">
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
                      {company.overall_rating && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Glassdoor Rating:</span>
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

                  {/* Apply Button - Full Width */}
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    Apply Now <ExternalLink className="h-5 w-5 ml-2" />
                  </a>

                  {/* Share Button */}
                  <ShareJobButton jobTitle={job.JobTitle} companyName={job.Company} />

                  {/* Report Button */}
                  <ReportJobButton
                    jobId={job.JobID}
                    jobTitle={job.JobTitle}
                    companyName={job.Company}
                  />
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