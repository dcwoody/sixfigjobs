'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface Job {
  JobID: string;
  JobTitle: string;
  LongDescription: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  Industry: string;
  JobType: string;
  SubmissionDate: string;
  ExpirationDate: string;
  CompanyLogo: string;
  "Related Submissions": string;
  PostedDate: string;
  is_remote: boolean;
  Interval: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  source: string;
  formatted_salary: string;
  job_url: string;
  job_url_direct: string;
  CreatedTime: string;
  slug: string;
  is_duplicate: boolean;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatJobTitle(title: string): string {
    // Check if the entire title is all uppercase (ignoring non-letters)
    const isAllCaps = title.replace(/[^A-Z]/gi, '').toUpperCase() === title.replace(/[^A-Z]/gi, '');

    return title
      .split(' ')
      .map(word => {
        // Preserve acronyms and special cases
        if (!isAllCaps && word === word.toUpperCase() && word.length <= 4) return word;
        // Capitalize otherwise
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('jobs_db').select('*');
      if (error) {
        setError(error.message);
        setJobs([]);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.JobTitle?.toLowerCase().includes(keyword.toLowerCase());
    const locationMatch = job.Location?.toLowerCase().includes(location.toLowerCase());
    return titleMatch && locationMatch;
  });

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">SixFigHires</h1>

       
        {/* Search Bar */}
                <div className="flex items-center rounded-lg border border-gray-300 shadow-sm overflow-hidden bg-white mb-10">
          {/* Keyword input */}
          <div className="flex items-center flex-1 px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 17a6 6 0 100-12 6 6 0 000 12z" />
            </svg>
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-sm placeholder-gray-500 text-gray-900 focus:outline-none"
            />
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* Location input */}
          <div className="flex items-center flex-1 px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-10a8 8 0 10-16 0c0 5.5 8 10 8 10z" />
            </svg>
            <input
              type="text"
              placeholder='City, state, zip code, or "remote"'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm placeholder-gray-500 text-gray-900 focus:outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={() => { }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition"
          >
            Search
          </button>
        </div>


        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job.JobID} className="relative p-6 bg-white border border-gray-200 rounded-lg shadow-md">
              {job.CompanyLogo && (
                <Image
                  src={job.CompanyLogo}
                  alt={`${job.Company} logo`}
                  className="absolute top-4 right-4 w-16 h-16 object-contain rounded-md"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900"><Link href={`/jobs/${job.slug}`}>{formatJobTitle(job.JobTitle)}</Link></h2>

              {/* Badges */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {/* New Badge */}
                {(() => {
                  const postedDate = new Date(job.PostedDate);
                  const today = new Date();
                  const daysSincePost = (today.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
                  if (daysSincePost <= 3) {
                    return (
                      <span className="text-white text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#28a745' }}>
                        NEW
                      </span>
                    );
                  }
                })()}

                {/* Remote Badge */}
                {job.is_remote && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#007bff' }}>
                    REMOTE
                  </span>
                )}

                {/* Government Badge */}
                {(job.Company?.toLowerCase().includes('government') || job.source?.toLowerCase().includes('usajobs')) && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#6c757d' }}>
                    GOV
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1 flex items-center space-x-1">
                <span>{job.Company}</span>
                {/* <span className="text-blue-700 text-xs font-medium uppercase">{job.source}</span> */}
              </p>
              <p className="text-gray-500 text-sm">{job.Location}</p>
              <p className="text-gray-800 font-medium mt-2">
                {job.formatted_salary || 'Salary not listed'}
                <span className="text-gray-500 text-sm ml-2">- {job.JobType.replace('_', ' ')}</span>
              </p>
              {job.ShortDescription && (
                <p className="mt-2 text-sm text-gray-600">{job.ShortDescription}</p>
              )}
              <div className="flex items-center space-x-3 mt-4">
                <a
                  href={job.job_url || job.job_url_direct}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-sm"
                >
                  Apply now
                </a>
                <button className="px-3 py-2 rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
                  🔖 Save
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(job.job_url || job.job_url_direct)}
                  className="px-3 py-2 rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
                >
                  🔗 Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
/* */