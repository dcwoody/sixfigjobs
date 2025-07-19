// src/app/page.tsx
'use client';

import MainLayout from '@/components/MainLayout';
import FeaturedJobs from '@/components/FeaturedJobs';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export default function Home() {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (jobQuery.trim()) params.set('q', jobQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());

    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-white">
        <div className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap xl:items-center -mx-4">
              {/* Left content */}
              <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
                <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                  Six-Figure Salaries,<br /> One Click Away
                </h1>
                <p className="mb-8 text-lg md:text-xl text-gray-500 font-medium">
                  Discover hand-picked, high-paying jobs from top companies. Whether remote or on-site, our platform connects you to opportunities earning $100K+—seamlessly, without the hassle.
                </p>
                <div className="flex flex-wrap">
                  <div className="w-full md:w-auto py-1 md:py-0 md:mr-4">
                    <a className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-white font-medium text-center bg-green-500 hover:bg-green-600 rounded-md shadow-sm" href="#">
                      Request a Demo
                    </a>
                  </div>
                  <div className="w-full md:w-auto py-1 md:py-0">
                    <a className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-gray-800 font-medium text-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm" href="#">
                      Sign Up
                    </a>
                  </div>
                </div>
              </div>

              {/* Right image/video block */}
              <div className="w-full md:w-1/2 px-4">
                <div className="relative mx-auto md:mr-0 max-w-max">
                  <Image src="/flex-ui-assets/elements/circle3-yellow.svg" alt="" width={112} height={112} className="absolute z-10 -left-14 -top-12 w-28 md:w-auto" />
                  <Image src="/flex-ui-assets/elements/dots3-blue.svg" alt="" width={112} height={112} className="absolute z-10 -right-7 -bottom-8 w-28 md:w-auto" />
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-pointer text-green-500 hover:text-green-600" width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="currentColor" />
                    <path d="M40.5 31.13L26.5 23.05...Z" fill="white" />
                  </svg>
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image src="/flex-ui-assets/images/headers/placeholder-video.png" alt="Video placeholder" width={600} height={400} className="rounded-2xl" />
                    <video className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 min-h-full min-w-full max-w-none" poster="/flex-ui-assets/images/testimonials/video-frame.jpeg" muted autoPlay loop>
                      <source src="https://static.shuffle.dev/files/video-placeholder.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search job title or keyword"
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-600"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-600"
              />
            </div>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-fit">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 mb-8">
            <span className="text-sm text-gray-600">Popular:</span>
            <button onClick={() => { setJobQuery('Software Engineer'); setLocationQuery('Remote'); }} className="text-sm text-green-600 hover:text-green-700 underline">Remote Software Engineer</button>
            <button onClick={() => { setJobQuery('Product Manager'); setLocationQuery(''); }} className="text-sm text-green-600 hover:text-green-700 underline">Product Manager</button>
            <button onClick={() => { setJobQuery('Data Scientist'); setLocationQuery('San Francisco'); }} className="text-sm text-green-600 hover:text-green-700 underline">Data Scientist</button>
          </div>
        </div>

        <FeaturedJobs />
      </section>

      {/* Newsletter CTA (rest of your code remains the same) */}
      {/* ... */}
    </MainLayout>
  );
}