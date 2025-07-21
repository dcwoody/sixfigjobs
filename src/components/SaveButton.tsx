'use client';

import { useState } from 'react';

interface SaveButtonProps {
  JobID: string;
}

export default function SaveButton({ JobID }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Replace with your save-to-database logic (e.g. Supabase or API call)
      // For now, just log the JobID to the console
      console.log("Saving job with ID:", JobID);
      await new Promise((res) => setTimeout(res, 500)); // Simulate delay
      setSaved(true);
    } catch (err) {
      console.error('Failed to save job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saved || loading}
      className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm border 
        ${saved ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
        />
      </svg>
      {saved ? 'Saved' : loading ? 'Saving...' : 'Save Job'}
    </button>
  );
}
