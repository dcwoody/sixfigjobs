// src/components/ReportJobButton.tsx
'use client';

import { Flag } from 'lucide-react';

interface ReportJobButtonProps {
  jobTitle: string;
  companyName: string;
}

export default function ReportJobButton({ jobTitle, companyName }: ReportJobButtonProps) {
  const handleReport = () => {
    const subject = encodeURIComponent(`Report Job: ${jobTitle} at ${companyName}`);
    const body = encodeURIComponent(`I would like to report an issue with this job posting:\n\nJob: ${jobTitle}\nCompany: ${companyName}\nURL: ${window.location.href}\n\nReason for report:\n[Please describe the issue]`);
    window.open(`mailto:support@sixfighires.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <button 
      onClick={handleReport}
      className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors"
    >
      <Flag className="h-4 w-4" />
      <span>Report Job</span>
    </button>
  );
}