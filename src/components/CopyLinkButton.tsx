// src/components/CopyLinkButton.tsx
'use client'; // Mark this as a client component

import { useState } from 'react';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}