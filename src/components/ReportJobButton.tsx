// src/components/ReportJobButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';

interface ReportJobButtonProps {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  className?: string;
  variant?: 'button' | 'link';
}

export default function ReportJobButton({ 
  jobId, 
  jobTitle, 
  companyName, 
  className = '',
  variant = 'button'
}: ReportJobButtonProps) {
  const router = useRouter();

  const handleReport = () => {
    // Create URL params for the contact page
    const params = new URLSearchParams({
      type: 'job_report',
      jobId: jobId,
      ...(jobTitle && { jobTitle }),
      ...(companyName && { company: companyName })
    });

    // Navigate to contact page with pre-filled information
    router.push(`/contact?${params.toString()}`);
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleReport}
        className={`w-full flex text-red-600 hover:text-red-800 text-sm font-medium items-center transition-colors ${className}`}
      >
        <Flag className="w-4 h-4 mr-1" />
        Report Job
      </button>
    );
  }

  return (
    <button
      onClick={handleReport}
      className={`w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors border border-red-200 ${className}`}
    >
      <Flag className="w-4 h-4 mr-2" />
      Report Job
    </button>
  );
}