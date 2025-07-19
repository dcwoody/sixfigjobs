// src/app/jobs/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import CopyLinkButton from '@/components/CopyLinkButton';
import { PostgrestError } from '@supabase/supabase-js';

import Hero from '@/components/Hero';
import Footer from '@/components/Footer'

interface Job {
  CompanyLogo: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  JobType: string;
  LongDescription: string;
  job_url: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: job, error }: { data: Job | null; error: PostgrestError | null } = await supabase
    .from('jobs_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    console.error('Job not found or Supabase error:', error);
    notFound();
  }

  return (
    <>
    <Hero />
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md relative">
        {job.CompanyLogo && (
          <Image
            src={job.CompanyLogo}
            alt={`${job.Company} logo`}
            width={48}
            height={48}
            className="absolute top-4 right-4 w-12 h-12 object-contain"
          />
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.JobTitle}</h1>
        <p className="text-sm text-gray-500 mb-2">
          {job.Company} • {job.Location}
        </p>
        <p className="text-gray-700 font-medium mb-4">
          {job.formatted_salary || 'Salary not listed'}{' '}
          <span className="ml-2 text-sm text-gray-500 uppercase">{job.JobType}</span>
        </p>

        <div className="prose prose-sm text-gray-800 max-w-none">
          {(job.LongDescription || '').split('\n').map((line: string, idx: number) => (
            <p key={idx}>{line.trim()}</p>
          ))}
        </div>

        <div className="mt-6 flex space-x-3">
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm font-semibold"
            >
              Apply Now
            </a>
          )}
          {job.job_url && <CopyLinkButton url={job.job_url} />}
        </div>
      </div>
    </div>
    <Footer />
  </>
  );
}