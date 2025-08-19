// src/components/ShareJobButton.tsx
'use client';

import { Share2 } from 'lucide-react';

interface ShareJobButtonProps {
  jobTitle: string;
  companyName: string;
}

export default function ShareJobButton({ jobTitle, companyName }: ShareJobButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${jobTitle} at ${companyName}`,
        text: `Check out this job opportunity: ${jobTitle} at ${companyName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg transition-colors"
    >
      <Share2 className="h-4 w-4" />
      <span>Share Job</span>
    </button>
  );
}