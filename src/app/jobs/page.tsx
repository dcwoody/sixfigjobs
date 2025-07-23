// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

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
  const resolvedSearchParams = await searchParams;
  const { q, location } = resolvedSearchParams;

  let query = supabase
    .from('jobs_db')
    .select('*')
    .order('PostedDate', { ascending: false });

  if (q) {
    query = query.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }

  if (location) {
    query = query.or(`Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`);
  }

  const { data: jobs, error } = await query;

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {q || location ? 'Search Results' : 'Explore Top Jobs'}
            </h1>
            <p className="text-gray-600">
              {q || location ? (
                <>
                  {jobs?.length} jobs found
                  {q && <span> for “{q}”</span>}
                  {location && <span> in “{location}”</span>}
                </>
              ) : (
                'Browse high-paying jobs curated just for you.'
              )}
            </p>
          </div>

          {error && (
            <div className="p-6 text-red-600 bg-white rounded-lg shadow border border-red-200">
              Error loading jobs: {error.message}
            </div>
          )}

          {!jobs?.length && !error && (
            <div className="text-center text-gray-600 py-12">
              <p>No jobs found. Try adjusting your search.</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs?.map((job) => (
              <Link
                key={job.JobID}
                href={`/jobs/${job.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  {job.CompanyLogo && (
                    <Image
                      src={job.CompanyLogo}
                      alt={`${job.Company} logo`}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded border border-gray-200 p-1"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.JobTitle}</h3>
                    <p className="text-blue-600 font-medium text-sm">{job.Company}</p>
                    <p className="text-gray-500 text-sm">{job.Location}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.ShortDescription}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    {job.formatted_salary || 'Salary not listed'}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">{job.JobType}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination placeholder (can be wired up later with page query param) */}
          {jobs && jobs.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <button className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <span className="text-sm text-gray-700">Page 1 of 1</span>
                <button className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
