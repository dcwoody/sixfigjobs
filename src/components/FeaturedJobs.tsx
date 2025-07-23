'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Job {
  JobID: string;
  JobTitle: string;
  ShortDescription: string;
  slug: string;
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.rpc('get_random_jobs');
      if (!error && data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (!loading && jobs.length === 0) {
    return <div className="text-center text-gray-600">No featured jobs found.</div>;
  }

  if (loading) return <div className="p-4 text-center">Loading featured jobs...</div>;

  return (
    <section className="py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Featured Jobs</h1>

      <div className="max-w-screen-lg mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.JobID} className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div className="p-4 md:p-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2">
                  {job.JobTitle}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-neutral-400 line-clamp-3">
                  {job.ShortDescription}
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 decoration-2 hover:text-blue-700 hover:underline focus:underline focus:outline-hidden focus:text-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-600 dark:focus:text-blue-600"
                  href={`/jobs/${job.slug}`}
                >
                  View Job
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </Link>
              </div>
              <div className="bg-gray-100 border-t border-gray-200 rounded-b-xl py-3 px-4 md:py-4 md:px-5 dark:bg-neutral-900 dark:border-neutral-700">
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Posted recently
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}