// src/components/JobCard.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getCompanyLogo, getCompanyPageUrl } from '@/lib/dbSync';

interface JobCardProps {
  job: {
    JobID: string;
    JobTitle: string;
    Company: string;
    Location: string;
    formatted_salary: string;
    JobType: string;
    ShortDescription: string;
    PostedDate: string;
    is_remote: boolean;
    CompanyLogo?: string | null; // ← FIXED: Added | null to match your data structure
    slug: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const [companyLogo, setCompanyLogo] = useState<string | null>(job.CompanyLogo || null);
  const [companyPageUrl, setCompanyPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCompanyData() {
      if (job.CompanyLogo && companyPageUrl) return; // Already have everything
      
      setLoading(true);
      try {
        const [logo, pageUrl] = await Promise.all([
          // ← FIXED: Handle undefined by converting to null
          job.CompanyLogo ? Promise.resolve(job.CompanyLogo) : getCompanyLogo(job.Company, job.CompanyLogo ?? null, supabase),
          getCompanyPageUrl(job.Company, supabase)
        ]);
        
        setCompanyLogo(logo);
        setCompanyPageUrl(pageUrl);
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, [job.Company, job.CompanyLogo, companyPageUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Company Header */}
      <div className="flex items-center mb-4">
        {loading ? (
          <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 animate-pulse" />
        ) : companyLogo ? (
          <Image
            src={companyLogo}
            alt={`${job.Company} logo`}
            width={40}
            height={40}
            className="rounded-md mr-3 object-contain"
            onError={() => setCompanyLogo(null)}
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md mr-3 flex items-center justify-center">
            <span className="text-white font-bold">
              {job.Company.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div>
          {companyPageUrl ? (
            <Link 
              href={companyPageUrl}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {job.Company}
            </Link>
          ) : (
            <span className="text-sm text-gray-600 font-medium">
              {job.Company}
            </span>
          )}
          <p className="text-xs text-gray-500">{job.Location}</p>
        </div>
      </div>

      {/* Job Details */}
      <Link href={`/jobs/${job.slug}`} className="block hover:text-blue-600 group">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {job.JobTitle}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {job.ShortDescription}
        </p>
        
        {/* Job Meta */}
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-green-600 font-semibold">
            {job.formatted_salary || 'Salary not specified'}
          </span>
          <span className="text-gray-500">
            {formatDate(job.PostedDate)}
          </span>
        </div>
        
        {/* Job Type Badges */}
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
            {job.JobType}
          </span>
          {job.is_remote && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
              Remote
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}