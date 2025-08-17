// src/app/jobs/page.tsx - Simplified for API approach
import { supabase } from '@/lib/supabase/client';
import JobsList from '@/components/JobsList';
import React from 'react';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    page?: string;
    jobType?: string;
    workType?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Load initial page of jobs (12 jobs for fast loading)
  const { data: initialJobs, error } = await supabase
    .from('job_listings_db')
    .select('*')
    .order('PostedDate', { ascending: false })
    .limit(12);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load jobs</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JobsList 
        initialJobs={initialJobs || []} 
        initialSearchParams={resolvedSearchParams}
      />
    </div>
  );
}