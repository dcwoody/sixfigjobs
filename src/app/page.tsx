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
      </section>

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          {/* Job Input */}
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

          {/* Location Input */}
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

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-fit"
          >
            Search
          </button>
        </form>

        {/* Popular filters */}
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

      <FeaturedJobs />

      {/* Newsletter CTA */}
      <div className="relative isolate overflow-hidden bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div className="relative isolate overflow-hidden bg-gray-900 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="max-w-xl lg:max-w-lg">
                <h2 className="text-4xl font-semibold tracking-tight text-white">
                  Stay Ahead: Get Six-Figure Job Alerts Delivered Weekly
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  Subscribe for curated job listings, straight to your inbox!
                </p>
                <div className="mt-6 flex max-w-md gap-x-4">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Subscribe
                  </button>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
                <div className="flex flex-col items-start">
                  <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-6 text-white"
                    >
                      <path
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <dt className="mt-4 text-base font-semibold text-white">Weekly articles</dt>
                  <dd className="mt-2 text-base text-gray-400">
                    Stay informed on high-paying opportunities!
                  </dd>
                </div>

                <div className="flex flex-col items-start">
                  <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-6 text-white"
                    >
                      <path
                        d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <dt className="mt-4 text-base font-semibold text-white">No spam</dt>
                  <dd className="mt-2 text-base text-gray-400">
                    Just opportunities to level up your career.
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
          >
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            ></div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}