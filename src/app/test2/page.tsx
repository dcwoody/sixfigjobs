// src/app/page.tsx - Professional Home Page
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, TrendingUp, Clock, Building2, DollarSign, Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase, Bell, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Footer from '@/components/Footer'
import NewsletterSignup from '@/components/NewsletterSignup';

// Hero Component with search functionality
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
                  <span className="absolute inset-0 -skew-y-6 bg-blue-600 rounded-sm" aria-hidden />
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
                      className="h-[60px] w-full inline-flex items-center justify-center rounded-lg font-semibold tracking-wide text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 lg:rounded-l-none"
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
          <div className="hidden md:block md:col-span-6 lg:col-span-5 order-1 md:order-2">
            <div className="relative">
              <div className="relative flex justify-end">
                <div className="rounded-xl shadow-sm shadow-gray-200 dark:shadow-gray-700 overflow-hidden lg:w-[400px] w-[280px]">
                  <Image
                    src="https://sixfigjob.com/img/2.jpg"
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
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-600 text-white border-4 border-white dark:border-slate-900 shadow-md shadow-gray-200 dark:shadow-gray-700 transition-transform hover:scale-105">
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
                    src="https://sixfigjob.com/img/1.jpg"
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
              <div className="pointer-events-none absolute -z-10 bottom-1/2 left-1/2 h-[400px] w-[400px] md:h-[500px] md:w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-tl from-blue-600 via-blue-600/50 to-blue-600/5 blur-3xl opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* background for contrast */}
      <div className="absolute inset-0 -z-20 bg-slate-900" aria-hidden />
    </section>
  );
}

export default async function HomePage() {
  // Get real stats from your database
  const [jobsData, companiesData] = await Promise.all([
    supabase.from('job_listings_db').select('formatted_salary, is_remote', { count: 'exact' }),
    supabase.from('company_db').select('*', { count: 'exact' })
  ]);

  const totalJobs = jobsData.count || 0;
  const totalCompanies = companiesData.count || 0;

  // Calculate average salary from real data
  const salaries = jobsData.data?.filter((job: any) => job.formatted_salary).map((job: any) => {
    const salary = job.formatted_salary.replace(/[^\d]/g, '');
    return parseInt(salary);
  }).filter((salary: number) => salary > 50000) || [];

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a: number, b: number) => a + b, 0) / salaries.length)
    : 150000;

  const remoteJobs = jobsData.data?.filter((job: any) => job.is_remote).length || 0;
  const remotePercentage = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;

  // Get featured jobs - Update to fetch 4 jobs and ensure at least one is remote
  const { data: allFeaturedJobs } = await supabase
    .from('job_listings_db')
    .select('*')
    .order('PostedDate', { ascending: false })
    .limit(10); // Get more jobs to filter from

  // Ensure we have at least one remote job in our featured selection
  const remoteJobsForFeatured = allFeaturedJobs?.filter((job: any) => job.is_remote) || [];
  const nonRemoteJobsForFeatured = allFeaturedJobs?.filter((job: any) => !job.is_remote) || [];

  let featuredJobs: any[] = [];

  if (remoteJobsForFeatured.length > 0) {
    // Add one remote job first
    featuredJobs.push(remoteJobsForFeatured[0]);

    // Add up to 3 more jobs (mix of remote and non-remote)
    const remainingJobs = [...remoteJobsForFeatured.slice(1), ...nonRemoteJobsForFeatured];
    featuredJobs.push(...remainingJobs.slice(0, 3));
  } else {
    // If no remote jobs available, just take first 4
    featuredJobs = allFeaturedJobs?.slice(0, 4) || [];
  }

  // Ensure we have exactly 4 jobs
  featuredJobs = featuredJobs.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section - NEW HERO COMPONENT */}
      <HeroJobs />

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalJobs.toLocaleString()}+</div>
              <div className="text-gray-600 font-medium">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">${(avgSalary/1000).toFixed(0)}k</div>
              <div className="text-gray-600 font-medium">Average Salary</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalCompanies}+</div>
              <div className="text-gray-600 font-medium">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{remotePercentage}%</div>
              <div className="text-gray-600 font-medium">Remote Friendly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-blue-600">High-Paying Jobs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked opportunities from companies that value top talent
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {featuredJobs.map((job: any, index: number) => (
              <Link 
                key={job.JobID} 
                href={`/jobs/${job.slug}`}
                className="group block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {job.JobTitle}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">{job.Company}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{job.is_remote ? 'Remote' : job.Location}</span>
                      {job.is_remote && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Remote</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.formatted_salary || '$100k+'}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(job.PostedDate).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View All Jobs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How <span className="text-blue-600">SixFigHires</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your path to a six-figure career starts here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <Search className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse Premium Jobs</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover carefully curated positions from top companies, all with salaries starting at $100k+
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-200">
                <CheckCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply with Confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Every job is verified and comes with detailed company information and transparent salary ranges
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                <Star className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Land Your Dream Role</h3>
              <p className="text-gray-600 leading-relaxed">
                Join thousands of professionals who've advanced their careers and increased their earning potential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Top Professionals Choose <span className="text-blue-600">SixFigHires</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're not just another job board. We're your partner in career advancement, 
                connecting ambitious professionals with opportunities that match their worth.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Verified High-Salary Positions</h3>
                    <p className="text-gray-600">Every job posting is verified to meet our $100k+ minimum salary requirement</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Direct Company Connections</h3>
                    <p className="text-gray-600">Skip the middleman and connect directly with hiring managers and decision makers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quality Over Quantity</h3>
                    <p className="text-gray-600">We curate opportunities from reputable companies, so you spend time on roles worth pursuing</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Average Salary Increase</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">32%</div>
                <p className="text-gray-600 mb-6">
                  SixFigHires users see an average salary increase of 32% when landing a new role through our platform
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>2024 User Survey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />

      {/* Footer */}
      <Footer />
    </div>
  );
}