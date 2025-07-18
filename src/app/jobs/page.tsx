// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

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
}

interface PageProps {
  searchParams: Promise<{ q?: string; location?: string }>;
}

export default async function JobsListingPage({ searchParams }: PageProps) {
  const { q, location } = await searchParams;
  
  let query = supabase
    .from('jobs_db')
    .select('*')
    .order('PostedDate', { ascending: false });

  // Apply search filters
  if (q) {
    query = query.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }
  
  if (location) {
    query = query.or(`Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`);
  }

  const { data: jobs, error } = await query;

  if (error) {
    return <div className="p-6 text-red-600">Error loading jobs: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {q || location ? 'Search Results' : 'All Jobs'}
          </h1>
          <p className="text-gray-600">
            {q || location ? (
              <>
                {jobs?.length} jobs found
                {q && <span> for &quot;{q}&quot;</span>}
                {location && <span> in &quot;{location}&quot;</span>}
              </>
            ) : (
              'Browse all available six-figure opportunities'
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs?.map((job: Job) => (
            <Link
              key={job.JobID}
              href={`/jobs/${job.slug}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {job.JobTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.Company} • {job.Location}
                  </p>
                </div>
                {job.CompanyLogo && (
                  <Image
                    src={job.CompanyLogo}
                    alt={`${job.Company} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain ml-4"
                  />
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {job.ShortDescription}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">
                  {job.formatted_salary || 'Salary not listed'}
                </span>
                <span className="text-xs text-gray-500 uppercase">
                  {job.JobType}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {(!jobs || jobs.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}