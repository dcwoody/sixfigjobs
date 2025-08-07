// src/components/FeaturedJobs.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, Building2, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Job {
  JobID: string;
  JobTitle: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  JobType: string;
  formatted_salary: string;
  slug: string;
  PostedDate: string;
  is_remote: boolean;
  CompanyLogo?: string;
  min_amount?: number;
  max_amount?: number;
}

function getSalaryRange(formatted_salary: string): { min: number; max: number } {
  if (!formatted_salary) return { min: 0, max: 0 };
  const numbers = formatted_salary.match(/\d+(?:,\d+)?/g);
  if (!numbers) return { min: 0, max: 0 };

  const salaries = numbers.map(num => {
    const cleanNum = parseInt(num.replace(/,/g, ''));
    return formatted_salary.toLowerCase().includes('k') ? cleanNum * 1000 : cleanNum;
  });

  return {
    min: Math.min(...salaries),
    max: Math.max(...salaries),
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently posted';

  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return 'Recently posted';
}

function generateTags(job: Job): string[] {
  const tags: string[] = [];

  if (job.JobType) tags.push(job.JobType);
  if (job.is_remote) tags.push('Remote');

  const { min } = getSalaryRange(job.formatted_salary);
  if (min >= 150000) tags.push('High Salary');
  else if (min >= 100000) tags.push('Six Figure');

  const location = job.Location?.toLowerCase() || '';
  if (location.includes('san francisco') || location.includes('sf')) tags.push('SF Bay Area');
  else if (location.includes('new york') || location.includes('nyc')) tags.push('NYC');
  else if (location.includes('seattle')) tags.push('Seattle');

  const title = job.JobTitle.toLowerCase();
  if (title.includes('engineer') || title.includes('developer')) tags.push('Engineering');
  else if (title.includes('manager') || title.includes('director')) tags.push('Management');
  else if (title.includes('data') || title.includes('analyst')) tags.push('Data');
  else if (title.includes('product')) tags.push('Product');
  else if (title.includes('design')) tags.push('Design');
  else if (title.includes('sales') || title.includes('marketing')) tags.push('Sales & Marketing');

  return tags.slice(0, 3);
}

export default async function FeaturedJobs() {
  const { data: allJobs, error } = await supabase
    .from('job_listings_db')
    .select('*')
    .order('PostedDate', { ascending: false })
    .limit(50);

  if (error || !allJobs) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg text-center">
        <h3 className="font-semibold mb-2">Error Loading Jobs</h3>
        <p className="text-sm">{error?.message || 'Unable to fetch jobs'}</p>
        <Link href="/jobs" className="inline-block mt-4 px-6 py-2 bg-[#31C7FF] text-white rounded-lg hover:bg-[#28B4E6] transition-colors">
          View All Jobs
        </Link>
      </div>
    );
  }

  const highPayingJobs = allJobs.filter(job => {
    if (job.min_amount && job.min_amount >= 100000) return true;
    if (!job.formatted_salary) return false;
    const { min } = getSalaryRange(job.formatted_salary);
    return min >= 100000;
  });

  const remoteJobs = highPayingJobs.filter(job => job.is_remote);
  const nonRemoteJobs = highPayingJobs.filter(job => !job.is_remote);

  let featuredJobs: Job[] = [];

  if (remoteJobs.length > 0) featuredJobs.push(remoteJobs[0]);

  const remainingSlots = 4 - featuredJobs.length;
  featuredJobs = [...featuredJobs, ...nonRemoteJobs.slice(0, remainingSlots)];

  if (featuredJobs.length < 4 && remoteJobs.length > 1) {
    const moreRemote = remoteJobs.slice(1, 4 - featuredJobs.length + 1);
    featuredJobs = [...featuredJobs, ...moreRemote];
  }

  if (featuredJobs.length < 4) {
    const extras = highPayingJobs
      .filter(job => !featuredJobs.some(f => f.JobID === job.JobID))
      .slice(0, 4 - featuredJobs.length);
    featuredJobs = [...featuredJobs, ...extras];
  }

  if (featuredJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No high-paying jobs available at the moment.</p>
        <Link href="/jobs" className="inline-block mt-4 px-6 py-2 bg-[#31C7FF] text-white rounded-lg hover:bg-[#28B4E6] transition-colors">
          View All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredJobs.map(job => {
        const tags = generateTags(job);
        return (
          <Link key={job.JobID} href={`/jobs/${job.slug}`} className="block group">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#31C7FF] transition-colors">
                      {job.JobTitle}
                    </h3>
                  </div>
                  {job.CompanyLogo && (
                    <div className="flex-shrink-0 ml-3">
                      <Image
                        src={job.CompanyLogo}
                        alt={`${job.Company} logo`}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-600 mb-1">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="font-medium text-sm truncate">{job.Company}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm truncate">{job.Location}</span>
                  {job.is_remote && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Remote
                    </span>
                  )}
                </div>

                {job.formatted_salary && (
                  <div className="flex items-center text-[#31C7FF] font-semibold text-sm mb-2">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{job.formatted_salary}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium bg-[#31C7FF]/10 text-[#31C7FF] rounded-md">
                    {tag}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                    +{tags.length - 2}
                  </span>
                )}
              </div>

              <div className="flex-shrink-0 space-y-3">
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDate(job.PostedDate)}</span>
                </div>

                <div className="w-full bg-[#31C7FF] hover:bg-[#28B4E6] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center group-hover:bg-[#28B4E6]">
                  View Job
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
