'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';

interface Props {
  popularSearches: { title: string; job: string; location: string }[];
}

export default function SearchForm({ popularSearches }: Props) {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (jobQuery.trim()) params.set('q', jobQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={jobQuery}
            onChange={(e) => setJobQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="City, state, or 'remote'"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 font-medium">Popular:</span>
          {popularSearches.map((search, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setJobQuery(search.job);
                setLocationQuery(search.location);
              }}
              className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {search.title}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="px-8 py-4 text-white font-semibold rounded-xl bg-[#31C7FF] hover:bg-[#28B4E6] transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
        >
          Search Jobs
          <Search className="w-5 h-5 ml-2" />
        </button>
      </div>
    </form>
  );
}
