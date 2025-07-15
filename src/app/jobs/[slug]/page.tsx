// src/app/jobs/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image'; // ✅ use Next.js image

export async function generateStaticParams() {
  const { data } = await supabase.from('jobs_db').select('slug');
  return (data || []).map((job: { slug: string }) => ({ slug: job.slug }));
}

export async function generateMetadata(input: { params: { slug: string } }): Promise<Metadata> {
  const { params } = input;

  const { data: job } = await supabase
    .from('jobs_db')
    .select('JobTitle, Company, Location')
    .eq('slug', params.slug)
    .single();

  return {
    title: job ? `${job.JobTitle} at ${job.Company}` : 'Job not found',
    description: job ? `${job.JobTitle} in ${job.Location}` : 'Explore job openings',
  };
}

export default async function JobDetail({ params }: { params: { slug: string } }) {
  const { data: job, error } = await supabase
    .from('jobs_db')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !job) return notFound();

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.JobTitle,
    description: job.LongDescription,
    datePosted: job.PostedDate,
    validThrough: job.ExpirationDate,
    employmentType: job.JobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.Company,
      logo: job.CompanyLogo,
    },
    jobLocation: {
      '@type': 'Place',
      address: job.Location,
    },
    baseSalary: job.formatted_salary,
    directApply: true,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(structuredData)}
      </script>

      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Main Content */}
        <div className="md:col-span-3 relative">
          {/* Floating buttons */}
          <div className="absolute top-0 right-0 flex space-x-2 mt-2 mr-2">
            <a
              href={job.job_url || job.job_url_direct}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded"
            >
              Apply Now
            </a>
            <button className="px-3 py-2 rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
              🔖 Save
            </button>
          </div>

          {/* Title and Logo */}
          <div className="flex justify-between items-start">
            <h1 className="mb-4 text-3xl md:text-4xl leading-tight font-bold text-gray-600">{job.JobTitle}</h1>
            {job.CompanyLogo && (
              <div className="w-16 h-16 relative ml-4">
                <Image
                  src={job.CompanyLogo}
                  alt={job.Company}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Location and Company */}
          <p className="text-lg md:text-xl text-gray-600 font-medium">{job.Company}</p>
          <p className="text-lg md:text-xl text-gray-500 font-medium">{job.Location}</p>
          <p className="text-md md:text-md text-gray-400 font-medium mb-2"><strong>Posted:</strong> {job.PostedDate}</p>

          {/* Divider */}
          <hr className="my-4 border-gray-300" />

          <p className="text-lg md:text-xl text-gray-600 font-medium mb-4">Job Details:</p>

          {/* Pills */}
          <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
            {job.formatted_salary && (
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                💰 {job.formatted_salary}
              </span>
            )}
            {job.JobType && (
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                🧑‍💼 {job.JobType.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-300" />

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 font-medium mb-4">Job Description:</p>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {job.LongDescription || job.ShortDescription}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div>
            <h2 className="text-lg md:text-xl text-gray-800 font-bold">Snapshot:</h2>
            <hr className="my-4 border-gray-300" />
            <p className="text-gray-800 mb-2"><strong>Company:</strong> {job.Company}</p>
            <p className="text-gray-800 mb-2"><strong>Location:</strong> {job.Location}</p>
            <p className="text-gray-800 mb-2"><strong>Type:</strong> {job.JobType}</p>
            <p className="text-gray-800 mb-2"><strong>Salary:</strong> {job.formatted_salary}</p>
            <p className="text-gray-800 mb-2"><strong>Posted:</strong> {job.PostedDate}</p>
          </div>
          <a
            href={job.job_url || job.job_url_direct}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded"
          >
            Apply Now
          </a>
        </aside>
      </div>
    </div>
  );
}
