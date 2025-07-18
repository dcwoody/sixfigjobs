'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export default function JobSearchForm() {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search parameters
    const params = new URLSearchParams();
    if (jobQuery.trim()) params.set('q', jobQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    
    // Navigate to search results page
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        {/* Job Title/Keyword Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search job title or keyword"
            value={jobQuery}
            onChange={(e) => setJobQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Location Search */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-fit"
        >
          Search
        </button>
      </form>

      {/* Quick filters or popular searches */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Popular:</span>
        <button
          onClick={() => {
            setJobQuery('Software Engineer');
            setLocationQuery('Remote');
          }}
          className="text-sm text-green-600 hover:text-green-700 underline"
        >
          Remote Software Engineer
        </button>
        <button
          onClick={() => {
            setJobQuery('Product Manager');
            setLocationQuery('');
          }}
          className="text-sm text-green-600 hover:text-green-700 underline"
        >
          Product Manager
        </button>
        <button
          onClick={() => {
            setJobQuery('Data Scientist');
            setLocationQuery('San Francisco');
          }}
          className="text-sm text-green-600 hover:text-green-700 underline"
        >
          Data Scientist
        </button>
      </div>
    </div>
  );
}