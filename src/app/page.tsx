'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import Image from 'next/image';

interface Job {
  JobID: string;
  JobTitle: string;
  LongDescription: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  Industry: string;
  JobType: string;
  SubmissionDate: string;
  ExpirationDate: string;
  CompanyLogo: string;
  PostedDate: string;
  is_remote: boolean;
  Interval: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  source: string;
  formatted_salary: string;
  job_url: string;
  job_url_direct: string;
  CreatedTime: string;
  is_duplicate: boolean;
  slug: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('jobs_db').select('*');
      if (error) {
        setError(error.message);
        setJobs([]);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const formatJobTitle = (title: string): string => {
    const isAllCaps = title.replace(/[^A-Z]/gi, '').toUpperCase() === title.replace(/[^A-Z]/gi, '');
    return title
      .split(' ')
      .map(word => {
        if (!isAllCaps && word === word.toUpperCase() && word.length <= 4) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.JobTitle?.toLowerCase().includes(keyword.toLowerCase());
    const locationMatch = job.Location?.toLowerCase().includes(location.toLowerCase());
    return titleMatch && locationMatch;
  });

  return (
    <MainLayout>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">Error: {error}</div>
      ) : (


        <section className="relative overflow-hidden bg-white">
          <div className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap xl:items-center -mx-4">
                {/* Left content */}
                <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
                  <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                    Six Figure Jobs
                  </h1>
                  <p className="mb-8 text-lg md:text-xl text-gray-500 font-medium">
                    We’re different. Flex is the only SaaS business platform that lets you run your business on one platform, seamlessly across all digital channels.
                  </p>
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-auto py-1 md:py-0 md:mr-4">
                      <a
                        className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-white font-medium text-center bg-green-500 hover:bg-green-600 rounded-md shadow-sm"
                        href="#"
                      >
                        Request a Demo
                      </a>
                    </div>
                    <div className="w-full md:w-auto py-1 md:py-0">
                      <a
                        className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-gray-800 font-medium text-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm"
                        href="#"
                      >
                        Sign Up
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right image/video block */}
                <div className="w-full md:w-1/2 px-4">
                  <div className="relative mx-auto md:mr-0 max-w-max">
                    <Image
                      src="/flex-ui-assets/elements/circle3-yellow.svg"
                      alt=""
                      width={112}
                      height={112}
                      className="absolute z-10 -left-14 -top-12 w-28 md:w-auto"
                    />
                    <Image
                      src="/flex-ui-assets/elements/dots3-blue.svg"
                      alt=""
                      width={112}
                      height={112}
                      className="absolute z-10 -right-7 -bottom-8 w-28 md:w-auto"
                    />
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-pointer text-green-500 hover:text-green-600"
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="32" cy="32" r="32" fill="currentColor" />
                      <path
                        d="M40.5 31.13L26.5 23.05C26.348 22.9622 26.1755 22.916 26 22.916C25.8245 22.916 25.652 22.9622 25.5 23.05C25.3474 23.1381 25.2208 23.265 25.133 23.4177C25.0452 23.5705 24.9993 23.7438 25 23.92V40.08C24.9993 40.2562 25.0452 40.4295 25.133 40.5822C25.2208 40.735 25.3474 40.8619 25.5 40.95C25.652 41.0378 25.8245 41.084 26 41.084C26.1755 41.084 26.348 41.0378 26.5 40.95L40.5 32.87C40.7819 32.6563 40.96 32.3506 41.007 32C41.007 31.6494 40.7819 31.3437 40.5 31.13ZM27 38.35V25.65L38 32L27 38.35Z"
                        fill="white"
                      />
                    </svg>
                    <div className="relative overflow-hidden rounded-2xl">
                      <Image
                        src="/flex-ui-assets/images/headers/placeholder-video.png"
                        alt="Video placeholder"
                        width={600}
                        height={400}
                        className="rounded-2xl"
                      />
                      <video
                        className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 min-h-full min-w-full max-w-none"
                        poster="/flex-ui-assets/images/testimonials/video-frame.jpeg"
                        muted
                        autoPlay
                        loop
                      >
                        <source
                          src="https://static.shuffle.dev/files/video-placeholder.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



      )}
    </MainLayout>
  );
} 
/* */