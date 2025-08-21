'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Bell, Briefcase, MapPin, Plus } from 'lucide-react';

function HeroJobs() {
  const [keyword, setKeyword] = useState('');
  // Use a different name to avoid clashing with the global window.location
  const [jobLocation, setJobLocation] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // plug in your routing logic here:
    // router.push(`/jobs?query=${encodeURIComponent(keyword)}&location=${encodeURIComponent(jobLocation)}`);
    console.log({ keyword, jobLocation });
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden flex items-center py-24 md:py-36 min-h-[70vh] md:min-h-[85vh]"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 lg:gap-10">
          {/* Left */}
          <div className="md:col-span-6 lg:col-span-7 order-2 md:order-1 mt-10 md:mt-0">
            <div className="lg:me-8">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5 text-white/90">
                Find your {' '}
                <span className="relative inline-block">
                  <span className="absolute inset-0 -skew-y-6 bg-emerald-600 rounded-sm" aria-hidden />
                  <span className="relative px-2 text-white">$100k Job</span>
                </span>
                <br /> at Leading Companies.
              </h1>

              <p className="text-slate-300 text-lg max-w-xl">
                Discover exclusive opportunities at top companies. Join thousands of professionals 
                who've found their dream careers with salaries starting at $100K+.

              </p>

              {/* Search card */}
              <div className="mt-6 bg-white/95 dark:bg-slate-900 border-0 shadow-sm rounded-xl p-4">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0">
                    {/* Keyword */}
                    <label className="relative lg:border-r lg:border-slate-200 dark:lg:border-slate-800 flex items-center gap-3 p-3 rounded-lg lg:rounded-r-none">
                      <Briefcase className="size-5 text-slate-500" />
                      <input
                        id="job-keyword"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search…"
                        className="w-full bg-gray-50 dark:bg-slate-800/70 border-0 outline-none rounded-md px-3 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </label>

                    {/* Location */}
                    <label className="relative lg:border-r lg:border-slate-200 dark:lg:border-slate-800 flex items-center gap-3 p-3 rounded-lg lg:rounded-none">
                      <MapPin className="size-5 text-slate-500" />
                      <input
                        id="job-location"
                        type="text"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        placeholder="Location"
                        className="w-full bg-gray-50 dark:bg-slate-800/70 border-0 outline-none rounded-md px-3 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="h-[60px] w-full inline-flex items-center justify-center rounded-lg font-semibold tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300 lg:rounded-l-none"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              <p className="mt-3 text-slate-400">
                <span className="text-slate-900 dark:text-white font-medium">Popular Searches :</span>{' '}
                Designer, Developer, Web, IOS, PHP Senior Engineer
              </p>
            </div>
          </div>

          {/* Right visuals */}
          <div className="md:col-span-6 lg:col-span-5 order-1 md:order-2">
            <div className="relative">
              <div className="relative flex justify-end">
                <div className="rounded-xl shadow-sm shadow-gray-200 dark:shadow-gray-700 overflow-hidden lg:w-[400px] w-[280px]">
                  <Image
                    src="https://i.imgur.com/MJvnrOJ.jpeg"
                    alt="Modern interview"
                    width={800}
                    height={600}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>

                {/* Floating avatar card */}
                <div className="absolute lg:bottom-20 -bottom-24 xl:-right-20 lg:-right-10 right-2 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 w-60 z-10">
                  <h5 className="text-lg font-semibold text-white mb-3">5k+ candidates get job</h5>
                  <ul className="relative flex items-center">
                    {[
                      'https://i.pravatar.cc/80?img=1',
                      'https://i.pravatar.cc/80?img=2',
                      'https://i.pravatar.cc/80?img=3',
                      'https://i.pravatar.cc/80?img=4',
                      'https://i.pravatar.cc/80?img=5',
                    ].map((src, idx) => (
                      <li key={idx} className="-ml-3 first:ml-0">
                        <span className="inline-block size-10 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-md shadow-gray-200 dark:shadow-gray-700 transition-transform hover:scale-105">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="avatar" className="h-full w-full object-cover" />
                        </span>
                      </li>
                    ))}
                    <li className="-ml-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white border-4 border-white dark:border-slate-900 shadow-md shadow-gray-200 dark:shadow-gray-700 transition-transform hover:scale-105">
                        <Plus className="size-4" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Lower-left image + bell chip */}
              <div className="absolute -bottom-16 left-0 md:-left-5">
                <div className="rounded-xl border-8 border-white dark:border-slate-900 overflow-hidden lg:w-[280px] w-[200px] shadow-sm">
                  <Image
                    src="https://i.imgur.com/wmutphp.jpeg"
                    alt="Interview"
                    width={560}
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                </div>

                <div className="absolute -top-6 left-2 md:-left-10 bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-gray-800 px-4 py-3 flex items-center w-max">
                  <Bell className="text-amber-500 size-6" />
                  <p className="text-base font-semibold text-white ml-2">Job Alert!</p>
                </div>
              </div>

              {/* Emerald gradient blob */}
              <div className="pointer-events-none absolute -z-10 bottom-1/2 left-1/2 h-[400px] w-[400px] md:h-[500px] md:w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-tl from-emerald-600 via-emerald-600/50 to-emerald-600/5 blur-3xl opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* background for contrast */}
      <div className="absolute inset-0 -z-20 bg-slate-900" aria-hidden />
    </section>
  );
}

export default function Page() {
  return (
    <main>
      <HeroJobs />
      {/* your existing sections/components below */}
    </main>
  );
}
