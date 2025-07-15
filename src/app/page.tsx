'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
  is_duplicate: boolean;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('jobs_db').select('*');
      console.log('Fetch response:', { data, error });

      if (error) {
        console.error('Error fetching jobs:', error.message);
        setError(error.message);
        setJobs([]);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.JobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">SixFigHires</h1>

          <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded text-gray-900 placeholder-gray-400 mb-6"
          />

       <div className="grid gap-6">
  {filteredJobs.map((job) => (
    <div key={job.JobID} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Job Title */}
      <h2 className="text-2xl font-semibold text-gray-900">{job.JobTitle}</h2>

      {/* Company and Source */}
      <p className="text-gray-600 text-sm mt-1 flex items-center space-x-1">
        <span>{job.Company}</span>
        <span>•</span>
        <span className="text-blue-700 text-xs font-medium uppercase">{job.source}</span>
      </p>

      {/* Location */}
      <p className="text-gray-500 text-sm">{job.Location}</p>

      {/* Salary & Job Type */}
      <p className="text-gray-800 font-medium mt-2">
        {job.formatted_salary ? `${job.formatted_salary}` : 'Salary not listed'}{' '}
        <span className="text-gray-500 text-sm ml-2">- {job.JobType.replace('_', ' ')}</span>
      </p>

      {/* Optional Description Preview */}
      {job.ShortDescription && (
        <p className="mt-2 text-sm text-gray-600">{job.ShortDescription}</p>
      )}

      {/* Call-to-Action Buttons */}
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
