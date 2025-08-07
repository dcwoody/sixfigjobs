'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function FilterSection({
  title,
  items,
  selectedItem,
  filterType,
  baseUrl,
  existingParams,
  showCheckbox = false,
  isLast = false,
}: {
  title: string;
  items: string[];
  selectedItem?: string;
  filterType: string;
  baseUrl: string;
  existingParams: Record<string, string | undefined>;
  showCheckbox?: boolean;
  isLast?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const buildUrl = (value: string) => {
    const params = new URLSearchParams(existingParams as Record<string, string>);
    params.set(filterType, value);
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={isLast ? 'mb-6' : 'mb-8'}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-bold text-gray-900 mb-4 hover:text-gray-700 transition-colors"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item}
              href={buildUrl(item)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                selectedItem === item
                  ? 'bg-[#31C7FF] text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {showCheckbox && (
                <div
                  className={`w-4 h-4 rounded border-2 mr-3 ${
                    selectedItem === item ? 'bg-white border-white' : 'border-gray-300'
                  }`}
                >
                  {selectedItem === item && (
                    <div className="w-2 h-2 bg-[#31C7FF] rounded-sm m-0.5"></div>
                  )}
                </div>
              )}
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
