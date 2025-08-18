// src/app/companies/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { MapPin, Users, Calendar, Building, Star, ExternalLink, DollarSign } from 'lucide-react';
import { loadCompanyData, loadJobData } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const companies = await loadCompanyData();
  const jobs = await loadJobData();
  
  const company = companies.find(c => c.slug === slug);
  if (!company) notFound();
  
  const companyJobs = jobs.filter(job => job.Company === company.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/companies" className="hover:text-blue-600">Companies</Link>
          <span>/</span>
          <span className="text-gray-900">{company.name}</span>
        </nav>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            {company.company_logo && (
              <img
                src={company.company_logo}
                alt={`${company.name} logo`}
                className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-4"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                  <p className="text-lg text-blue-600">{company.industry}</p>
                </div>
                {company.overall_rating && (
                  <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    <div className="ml-2">
                      <div className="font-bold text-lg">{company.overall_rating}/5</div>
                      <div className="text-sm text-gray-600">Overall Rating</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Headquarters</div>
                  <div className="font-medium">{company.headquarters}</div>
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

              <div className="flex items-center space-x-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                )}
                <span className="text-gray-600">{company.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Company */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {company.name}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">{company.description}</p>
                {company.mission && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Mission</h3>
                    <p className="text-blue-800">{company.mission}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Company Jobs */}
            {companyJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Open Positions ({companyJobs.length})
                  </h2>
                  <Link href="/jobs" className="text-blue-600 hover:text-blue-800 transition-colors">
                    View All Jobs →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <div key={job.JobID} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/jobs/${job.slug}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                              {job.JobTitle}
                            </h3>
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.Location}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.formatted_salary}
                            </div>
                            {job.is_remote && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Remote
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{job.ShortDescription}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/jobs/${job.slug}`}>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Company Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Industry</div>
                  <div className="font-medium">{company.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Revenue</div>
                  <div className="font-medium">{company.revenue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium">{company.type}</div>
                </div>
                {company.ceo_name && (
                  <div>
                    <div className="text-sm text-gray-600">CEO</div>
                    <div className="font-medium">{company.ceo_name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Ratings */}
            {(company.overall_rating || company.career_rating) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Ratings</h3>
                <div className="space-y-3">
                  {company.overall_rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{company.overall_rating}/5</span>
                      </div>
                    </div>
                  )}
                  {company.career_rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Career Opportunities</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{company.career_rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}