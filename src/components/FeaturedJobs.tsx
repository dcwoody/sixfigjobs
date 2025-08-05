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
  min_amount?: number;  // Changed from salary_min
  max_amount?: number;  // Changed from salary_max
}

const FeaturedJobs = async () => {
  // Function to extract salary info and filter for 100k+ jobs
  const getSalaryRange = (formatted_salary: string): { min: number; max: number } => {
    if (!formatted_salary) return { min: 0, max: 0 };
    
    // Extract numbers from salary string (e.g., "$120k - $180k" or "$150,000")
    const numbers = formatted_salary.match(/\d+(?:,\d+)?/g);
    if (!numbers) return { min: 0, max: 0 };
    
    const salaries = numbers.map(num => {
      const cleanNum = parseInt(num.replace(/,/g, ''));
      // If it's in thousands format (like "120k"), multiply by 1000
      if (formatted_salary.toLowerCase().includes('k')) {
        return cleanNum * 1000;
      }
      return cleanNum;
    });
    
    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  };

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently posted';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return 'Recently posted';
  };

  // Generate tags based on job data
  const generateTags = (job: Job): string[] => {
    const tags: string[] = [];
    
    // Add job type
    if (job.JobType) tags.push(job.JobType);
    
    // Add remote tag
    if (job.is_remote) tags.push('Remote');
    
    // Add salary range tag for high earners
    const { min } = getSalaryRange(job.formatted_salary);
    if (min >= 150000) tags.push('High Salary');
    else if (min >= 100000) tags.push('Six Figure');
    
    // Add location-based tags
    if (job.Location?.toLowerCase().includes('san francisco') || job.Location?.toLowerCase().includes('sf')) {
      tags.push('SF Bay Area');
    } else if (job.Location?.toLowerCase().includes('new york') || job.Location?.toLowerCase().includes('nyc')) {
      tags.push('NYC');
    } else if (job.Location?.toLowerCase().includes('seattle')) {
      tags.push('Seattle');
    }
    
    // Add industry tags based on job title
    const title = job.JobTitle.toLowerCase();
    if (title.includes('engineer') || title.includes('developer')) {
      tags.push('Engineering');
    } else if (title.includes('manager') || title.includes('director')) {
      tags.push('Management');
    } else if (title.includes('data') || title.includes('analyst')) {
      tags.push('Data');
    } else if (title.includes('product')) {
      tags.push('Product');
    } else if (title.includes('design')) {
      tags.push('Design');
    } else if (title.includes('sales') || title.includes('marketing')) {
      tags.push('Sales & Marketing');
    }
    
    return tags.slice(0, 3); // Limit to 3 tags
  };

  try {
    // Add connection test
    console.log('Testing Supabase connection...');
    
    // Test basic connection first
    const { error: testError } = await supabase
      .from('job_listings_db')  // Changed back to correct table name
      .select('JobID')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return (
        <div className="text-red-600 p-4 border border-red-200 rounded-lg">
          <h3 className="font-semibold mb-2">Database Connection Error</h3>
          <p className="text-sm mb-2">Error: {testError.message}</p>
          <p className="text-xs text-gray-600">Code: {testError.code}</p>
          <p className="text-xs text-gray-600">Details: {testError.details}</p>
        </div>
      );
    }

    console.log('Connection test successful, fetching jobs...');

    // Fetch all recent jobs
    const { data: allJobs, error } = await supabase
      .from('job_listings_db')  // Changed back to correct table name
      .select('*')
      .order('PostedDate', { ascending: false })
      .limit(50); // Get more jobs to filter from

    if (error) {
      console.error('Error fetching jobs:', error);
      return (
        <div className="text-red-600 p-4 border border-red-200 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Jobs</h3>
          <p className="text-sm mb-2">Error: {error.message}</p>
          <p className="text-xs text-gray-600">Code: {error.code}</p>
          <p className="text-xs text-gray-600">Details: {error.details || 'No additional details'}</p>
        </div>
      );
    }

    console.log(`Fetched ${allJobs?.length || 0} jobs from database`);

    if (!allJobs || allJobs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No jobs found in the database</p>
          <Link 
            href="/jobs" 
            className="inline-block mt-4 px-6 py-2 bg-[#31C7FF] text-white rounded-lg hover:bg-[#28B4E6] transition-colors"
          >
            View All Jobs
          </Link>
        </div>
      );
    }

    // Filter for jobs over $100k (using both formatted_salary and min_amount)
    const highPayingJobs = allJobs.filter(job => {
      // First try using min_amount if available
      if (job.min_amount && job.min_amount >= 100000) {
        return true;
      }
      
      // Fallback to formatted_salary parsing
      if (!job.formatted_salary) return false;
      const { min } = getSalaryRange(job.formatted_salary);
      return min >= 100000;
    });

    console.log(`Found ${highPayingJobs.length} high-paying jobs`);

    // Separate remote and non-remote jobs
    const remoteJobs = highPayingJobs.filter(job => job.is_remote);
    const nonRemoteJobs = highPayingJobs.filter(job => !job.is_remote);

    // Select featured jobs (ensure at least 1 remote if available)
    let featuredJobs: Job[] = [];
    
    // Add 1 remote job if available
    if (remoteJobs.length > 0) {
      featuredJobs.push(remoteJobs[0]);
    }
    
    // Fill remaining spots with non-remote jobs
    const remainingSlots = 4 - featuredJobs.length;
    const additionalJobs = nonRemoteJobs.slice(0, remainingSlots);
    featuredJobs = [...featuredJobs, ...additionalJobs];
    
    // If we don't have enough non-remote jobs, add more remote jobs
    if (featuredJobs.length < 4 && remoteJobs.length > 1) {
      const moreRemoteJobs = remoteJobs.slice(1, 4 - featuredJobs.length + 1);
      featuredJobs = [...featuredJobs, ...moreRemoteJobs];
    }
    
    // If still not enough, use any high-paying jobs
    if (featuredJobs.length < 4) {
      const remainingJobs = highPayingJobs
        .filter(job => !featuredJobs.some(fJob => fJob.JobID === job.JobID))
        .slice(0, 4 - featuredJobs.length);
      featuredJobs = [...featuredJobs, ...remainingJobs];
    }

    // Limit to 4 jobs
    featuredJobs = featuredJobs.slice(0, 4);

    if (featuredJobs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No high-paying jobs available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Found {allJobs.length} total jobs, but none meet the $100k+ criteria.</p>
          <Link 
            href="/jobs" 
            className="inline-block mt-4 px-6 py-2 bg-[#31C7FF] text-white rounded-lg hover:bg-[#28B4E6] transition-colors"
          >
            View All Jobs
          </Link>
        </div>
      );
    }

    console.log(`Displaying ${featuredJobs.length} featured jobs`);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredJobs.map((job) => {
          const tags = generateTags(job);
          
          return (
            <Link key={job.JobID} href={`/jobs/${job.slug}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                {/* Header */}
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
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{job.Company}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{job.Location}</span>
                    {job.is_remote && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                  
                  {job.formatted_salary && (
                    <div className="flex items-center text-[#31C7FF] font-semibold text-sm mb-2">
                      <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{job.formatted_salary}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="flex-grow mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {job.ShortDescription}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs font-medium bg-[#31C7FF]/10 text-[#31C7FF] rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                      +{tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Footer */}
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
          )}
        )}
      </div>
    );

  } catch (error) {
    console.error('Error in FeaturedJobs component:', error);
    return (
      <div className="text-center py-8">
        <div className="text-red-600 p-4 border border-red-200 rounded-lg">
          <h3 className="font-semibold mb-2">Unexpected Error</h3>
          <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
        <Link 
          href="/jobs" 
          className="inline-block mt-4 px-6 py-2 bg-[#31C7FF] text-white rounded-lg hover:bg-[#28B4E6] transition-colors"
        >
          View All Jobs
        </Link>
      </div>
    );
  }
};

export default FeaturedJobs;