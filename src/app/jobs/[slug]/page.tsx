// src/app/jobs/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

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
  slug: string;
}

export async function generateStaticParams() {
  const { data } = await supabase.from('jobs_db').select('slug');
  return (data || []).map((job: { slug: string }) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(structuredData)}
      </script>

      {/* Main Content */}
      <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {job.JobTitle}
          </h1>
          {job.CompanyLogo && (
            <img
              src={job.CompanyLogo}
              alt={job.Company}
              className="w-16 h-16 object-contain ml-4"
            />
          )}
        </div>
        <p className="text-gray-600 mb-1">{job.Company} • {job.Location}</p>
        <p className="text-gray-800 font-medium mb-4">{job.formatted_salary}</p>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {job.LongDescription || job.ShortDescription}
        </p>
      </div>

      {/* Sidebar */}
      <aside className="bg-gray-100 p-4 rounded-lg shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Quick Info</h2>
          <p><strong>Company:</strong> {job.Company}</p>
          <p><strong>Location:</strong> {job.Location}</p>
          <p><strong>Type:</strong> {job.JobType}</p>
          <p><strong>Posted:</strong> {job.PostedDate}</p>
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
  );
}