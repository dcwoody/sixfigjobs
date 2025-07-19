// src/app/jobs/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import CopyLinkButton from '@/components/CopyLinkButton'; // Optional, if you're using it

interface PageProps {
  params: { slug: string }; // ✅ NOT a Promise
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  const { data: job, error } = await supabase
    .from('jobs_db')
    .select('*')
    .eq('slug', slug)
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
          {/* If using a client component to copy */}
          <CopyLinkButton url={job.job_url} />
        </div>
      </div>
    </div>
  );
}
