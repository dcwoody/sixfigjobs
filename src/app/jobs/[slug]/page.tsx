// src/app/jobs/[slug]/page.tsx

import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Update the interface to reflect that params is now a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params since it's now a Promise in Next.js 15
  const { slug } = await params;
  
const { data: job, error } = await supabase
  .from('jobs_db')
  .select('*')
  .eq('slug', slug) // ✅ Correct slug-based fetch
  .single();

  if (error || !job) {
    notFound();
  }

  return (
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
          {job.LongDescription?.split('\n').map((line: string, idx: number) => (
            <p key={idx}>{line.trim()}</p>
          ))}
        </div>

        <div className="mt-6 flex space-x-3">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm font-semibold"
          >
            Apply Now
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(job.job_url)}
            className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}