// src/app/jobs/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
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

// CORRECTED: searchParams is now typed as a Promise
interface PageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    page?: string;
  }>;
}

export default async function JobsListingPage({ searchParams }: PageProps) {
  // CORRECTED: Await the searchParams Promise before destructuring
  const resolvedSearchParams = await searchParams;
  const { q, location, page } = resolvedSearchParams;

  const LIMIT = 10;
  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * LIMIT;

  let query = supabase
    .from('jobs_db')
    .select('*, count()', { count: 'exact' })
    .order('PostedDate', { ascending: false });

  if (q) {
    query = query.or(`JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`);
  }
  if (location) {
    query = query.or(`Location.ilike.%${location}%,is_remote.eq.${location.toLowerCase().includes('remote')}`);
  }

  query = query.range(offset, offset + LIMIT - 1);

  const { data: jobs, error, count }: { data: Job[] | null; error: PostgrestError | null; count: number | null } = await query;

  if (error) {
    return <div className="p-6 text-red-600">Error loading jobs: {error.message}</div>;
  }

  const totalPages = count ? Math.ceil(count / LIMIT) : 0;

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
                  {count} jobs found
                  {q && <span> for “{q}”</span>}
                  {location && <span> in “{location}”</span>}
                </>
              ) : (
                'Browse high-paying jobs curated just for you.'
              )}
            </p>
          </div>
          {/* Search and Filter UI Placeholder */}
          <div className="mb-6">
            {/* You would place your search and filter form here. */}
          </div>
          {(!jobs || jobs.length === 0) ? (
            <div className="text-center text-gray-600 py-12">
              <p>No jobs found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Job Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Salary
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.JobID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {job.CompanyLogo && (
                            <Image
                              src={job.CompanyLogo}
                              alt={`${job.Company} logo`}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain rounded mr-3"
                            />
                          )}
                          <div>
                            <Link href={`/jobs/${job.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {job.JobTitle}
                            </Link>
                            <p className="text-xs text-gray-500">{job.Company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="text-sm text-gray-500">{job.Location}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 hidden sm:inline-flex">
                          {job.JobType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-green-600 font-medium">
                          {job.formatted_salary || 'Salary not listed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/jobs/${job.slug}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {count && count > LIMIT && (
            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <Link
                  href={{
                    pathname: '/jobs',
                    query: { ...resolvedSearchParams, page: currentPage - 1 },
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  Previous
                </Link>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Link
                  href={{
                    pathname: '/jobs',
                    query: { ...resolvedSearchParams, page: currentPage + 1 },
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 ${
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                  }`}
                  aria-disabled={currentPage === totalPages}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}