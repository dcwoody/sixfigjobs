// src/app/page.tsx - Complete Server Component with Navigation, Featured Jobs, and Footer
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import {
  Search, MapPin, TrendingUp, Clock, Building2, DollarSign,
  Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase,
  Users, Award, Zap, Plus, Bell
} from 'lucide-react';
import Footer from '@/components/Footer';
import NewsletterSignup from '@/components/NewsletterSignup';

// Enable ISR with revalidation
export const revalidate = 300; // 5 minutes

// Utility functions moved outside component
const getJobBadge = (job: any) => {
  const company = job.Company?.toLowerCase() || '';
  const title = job.JobTitle?.toLowerCase() || '';
  
  if (company.includes('government') || company.includes('federal') || 
      title.includes('government') || title.includes('federal')) {
    return { text: 'GOVT', color: 'bg-gray-600' };
  }
  if (job.is_remote) {
    return { text: 'REMOTE', color: 'bg-green-600' };
  }
  return null;
};

const formatPostedDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

async function getFeaturedJobs() {
  const supabase = await createClient();
  
  // Get 1 government job with company data
  const { data: govJobs } = await supabase
    .from('job_listings_db')
    .select(`
      *,
      company_db!inner(
        company_logo,
        name
      )
    `)
    .or('Company.ilike.%government%,Company.ilike.%federal%,Company.ilike.%state%,JobTitle.ilike.%government%,JobTitle.ilike.%federal%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  // Get 1 remote job (exclude government jobs) with company data
  const { data: remoteJobs } = await supabase
    .from('job_listings_db')
    .select(`
      *,
      company_db!inner(
        company_logo,
        name
      )
    `)
    .eq('is_remote', true)
    .not('Company', 'ilike', '%government%')
    .not('Company', 'ilike', '%federal%')
    .not('JobTitle', 'ilike', '%government%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  // Get 1 regular job (not remote, not government) with company data
  const { data: regularJobs } = await supabase
    .from('job_listings_db')
    .select(`
      *,
      company_db!inner(
        company_logo,
        name
      )
    `)
    .eq('is_remote', false)
    .not('Company', 'ilike', '%government%')
    .not('Company', 'ilike', '%federal%')
    .not('JobTitle', 'ilike', '%government%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  // Combine the jobs
  const featuredJobs = [
    ...(regularJobs || []),
    ...(remoteJobs || []), 
    ...(govJobs || [])
  ].slice(0, 3);

  return featuredJobs;
}

export default async function HomePage() {
  const supabase = await createClient();
  const featuredJobs = await getFeaturedJobs();
  
  // Get real stats from your database in parallel
  const [jobsResult, companiesResult] = await Promise.all([
    supabase
      .from('job_listings_db')
      .select('formatted_salary, is_remote', { count: 'exact' }),

    supabase
      .from('company_db') // Fixed table name
      .select('*', { count: 'exact' })
  ]);

  const totalJobs = jobsResult.count || 0;
  const totalCompanies = companiesResult.count || 0;

  // Calculate average salary from real data
  const salaries = jobsResult.data?.filter((job: any) => job.formatted_salary)
    .map((job: any) => {
      const salary = job.formatted_salary.replace(/[^\d]/g, '');
      return parseInt(salary);
    })
    .filter((salary: number) => salary > 50000) || [];

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a: number, b: number) => a + b, 0) / salaries.length)
    : 150000;

  const remoteJobs = jobsResult.data?.filter((job: any) => job.is_remote).length || 0;
  const remotePercentage = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;

  // Get initial jobs for JobDirectory component
  const { data: initialJobs } = await supabase
    .from('job_listings_db')
    .select(`
      JobID,
      JobTitle,
      Company,
      Location,
      formatted_salary,
      slug,
      ShortDescription,
      PostedDate,
      is_remote,
      JobType,
      company_id
    `)
    .order('PostedDate', { ascending: false })
    .limit(24);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Main Headline */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-white font-medium">Premium Job Board</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Find Six-Figure Job Opportunities
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  at Leading Companies
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
                Discover exclusive opportunities at top companies. Join thousands of professionals
                who've found their dream careers with salaries starting at $100K+.
              </p>
            </div>
          </div>

          {/* Search Bar and CTA Buttons */}
          <div className="max-w-4xl mx-auto mb-8">
            {/* Search Form */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
              <form action="/jobs" method="GET" className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Job title, company, or keyword..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>

                <div className="relative lg:w-64">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location or 'Remote'"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center lg:w-auto"
                >
                  <Search className="w-6 h-6 mr-2" />
                  Search Jobs
                </button>
              </form>

              {/* Quick Search Suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-white/80 text-sm">Popular searches:</span>
                <Link href="/jobs?q=software engineer" className="bg-white/10 text-white text-sm px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                  Software Engineer
                </Link>
                <Link href="/jobs?q=product manager" className="bg-white/10 text-white text-sm px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                  Product Manager
                </Link>
                <Link href="/jobs?q=data scientist" className="bg-white/10 text-white text-sm px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                  Data Scientist
                </Link>
                <Link href="/jobs?location=remote" className="bg-white/10 text-white text-sm px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                  Remote Jobs
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

{/* hero section 2 */}
<section
  id="home"
  className="relative overflow-hidden flex items-center py-24 md:py-36 min-h-[70vh] md:min-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
>
  {/* Additional gradient overlays for depth */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-slate-900/50" />
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-blue-400/20" />
  
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 lg:gap-10">
      {/* Left */}
      <div className="md:col-span-6 lg:col-span-7 order-2 md:order-1 mt-10 md:mt-0">
        <div className="lg:me-8">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5 text-white">
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
          <div className="mt-6 bg-white dark:bg-slate-900 border-0 shadow-sm rounded-xl p-4">
            <form action="/jobs" method="GET" className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, company, or keyword..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              <div className="relative lg:w-64">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location or 'Remote'"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center lg:w-auto"
              >
                <Search className="w-6 h-6 mr-2" />
                Search Jobs
              </button>
            </form>
          </div>

          <p className="mt-3 text-slate-400">
            <span className="text-white font-medium">Popular Searches :</span>{' '}
            Designer, Developer, Web, IOS, PHP Senior Engineer
          </p>
        </div>
      </div>

      {/* Right visuals */}
      <div className="hidden md:block md:col-span-6 lg:col-span-5 order-1 md:order-2">
        <div className="relative">
          <div className="relative flex justify-end">
            <div className="rounded-xl shadow-sm shadow-gray-200 dark:shadow-gray-700 overflow-hidden lg:w-[400px] w-[280px]">
              <img
                src="https://www.sixfigjob.com/img/2.jpg"
                alt="Modern interview"
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Floating avatar card */}
            <div className="absolute lg:bottom-20 -bottom-24 xl:-right-20 lg:-right-10 right-2 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 w-60 z-10">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">More $100k jobs!</h5>
              <ul className="relative flex items-center">
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=150&q=80',
                ].map((src, idx) => (
                  <li key={idx} className="-ml-3 first:ml-0">
                    <span className="inline-block size-10 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-md shadow-gray-200 dark:shadow-gray-700 transition-transform hover:scale-105">
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
              <img
                src="https://www.sixfigjob.com/img/1.jpg"
                alt="Interview"
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="absolute -top-6 left-2 md:-left-10 bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-gray-800 px-4 py-3 flex items-center w-max">
              <Bell className="text-amber-500 size-6" />
              <p className="text-base font-semibold text-gray-900 dark:text-white ml-2">Job Alert!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>



      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another job board. We're your career advancement partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Matches</h3>
              <p className="text-gray-600">
                Our AI-powered algorithm matches you with relevant opportunities in real-time.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Positions</h3>
              <p className="text-gray-600">
                Access exclusive six-figure roles that aren't available on other platforms.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Direct Connections</h3>
              <p className="text-gray-600">
                Connect directly with hiring managers and skip the recruiter middleman.
              </p>
            </div>
          </div>
        </div>
      </section>

     {/* Featured Jobs Section */}
      {featuredJobs && featuredJobs.length > 0 && (
        <section className="py-24 bg-white relative">
          {/* Background Color */}
          <div className="absolute inset-0 grid grid-cols-12 size-full">
            <div className="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full dark:bg-neutral-800"></div>
          </div>
          {/* End Background Color */}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              
              {/* Left side - Image */}
              <div className="lg:w-1/2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&h=720&q=80"
                    alt="Professional workspace"
                    className="rounded-2xl shadow-2xl object-cover w-full h-[600px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>

              {/* Right side - Jobs */}
              <div className="lg:w-1/2">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    FEATURED JOBS
                  </h2>
                  <p className="text-lg text-gray-600">
                    PREMIUM POSITIONS FROM OUR TOP PARTNER COMPANIES
                  </p>
                </div>

                {/* Job Listings */}
                <div className="space-y-6">
                  {featuredJobs.map((job: any, index: number) => {
                    const badge = getJobBadge(job);
                    
                    return (
                      <div key={job.JobID} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                        <div className="flex items-start space-x-4">
                          
                          {/* Company Logo */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {job.company_db?.company_logo ? (
                              <img
                                src={job.company_db.company_logo}
                                alt={`${job.Company} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <Building2 className="w-6 h-6 text-gray-400" style={{ display: job.company_db?.company_logo ? 'none' : 'block' }} />
                          </div>

                          {/* Job Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {job.JobTitle}
                              </h3>
                              {badge && (
                                <span className={`px-2 py-1 text-xs font-bold text-white rounded ${badge.color}`}>
                                  {badge.text}
                                </span>
                              )}
                            </div>
                            
                            {/* Company Name */}
                            <div className="text-gray-500 text-sm mb-2">
                              {job.Company}
                            </div>
                            
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="text-sm truncate">{job.Location}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {job.formatted_salary && (
                                <div className="flex items-center text-green-600">
                                  <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                                  <span className="text-sm font-medium">{job.formatted_salary}</span>
                                </div>
                              )}
                              
                              {/* View Details Button - Bottom Right */}
                              <Link
                                href={`/jobs/${job.slug}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View More Jobs Button */}
                <div className="mt-8">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors transform hover:scale-105 shadow-lg"
                  >
                    View More Jobs
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Footer */}
      <Footer />
    </div>
  );
}