// src/components/CopyLinkButton.tsx
'use client';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <button
      onClick={handleCopyLink}
      className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
    >
      Copy Link
    </button>
  );
}