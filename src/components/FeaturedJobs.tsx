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
        <div key={job.JobID} className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg">
          <div className="p-4 sm:p-6">
            <h5 className="mb-2 text-slate-800 text-xl font-semibold truncate">
              {job.JobTitle}
            </h5>
            <p className="text-slate-600 leading-normal font-light line-clamp-3">
              {job.ShortDescription}
            </p>
            <Link href={`/jobs/${job.slug}`}>
              <button className="rounded-md bg-slate-800 py-2 px-4 mt-6 text-sm text-white hover:bg-slate-700">
                Read more
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}