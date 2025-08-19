// src/app/page.tsx - Professional Home Page
import React from 'react';
import Link from 'next/link';
import { Search, MapPin, TrendingUp, Clock, Building2, DollarSign, Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Footer from '@/components/Footer'
import NewsletterSignup from '@/components/NewsletterSignup';

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

      {/* Hero Section - Dark Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(34,197,94,0.2),transparent_50%)]" />
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 animate-[float_20s_ease-in-out_infinite]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-300 mr-2" />
              <span className="text-sm font-medium text-blue-100">Over {totalJobs.toLocaleString()}+ Opportuntiies Await!</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-white">Unlock Your</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Six-Figure Future
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto mb-12 leading-relaxed">
              Connect with top companies offering $100K+ positions. Your next breakthrough is waiting.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <form action="/jobs" method="GET" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Job title, keywords, or company"
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      placeholder="City, state, or remote"
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-700 placeholder-gray-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Find Jobs
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose SixFigHires?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect ambitious professionals with premium opportunities at top-tier companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Positions</h3>
              <p className="text-gray-600">
                Access exclusive six-figure opportunities from Fortune 500 companies and fast-growing startups.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Companies</h3>
              <p className="text-gray-600">
                All companies are thoroughly vetted to ensure legitimate opportunities and competitive compensation.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Remote Friendly</h3>
              <p className="text-gray-600">
                {remotePercentage}% of our positions offer remote or hybrid work options for maximum flexibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs && featuredJobs.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured Opportunities</h2>
              <p className="text-xl text-gray-600">
                Hand-picked positions from our top partner companies
              </p>
            </div>

            {/* 1x4 Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredJobs.map((job: any) => {
                // Format posted date
                const formatPostedDate = (dateString: string) => {
                  const date = new Date(dateString);
                  if (isNaN(date.getTime())) return 'Recently';
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

                  if (diffHours < 24) return `${diffHours} hours ago`;
                  if (diffDays === 1) return '1 day ago';
                  if (diffDays < 7) return `${diffDays} days ago`;
                  return `${Math.floor(diffDays / 7)} weeks ago`;
                };

                return (
                  <div key={job.JobID} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">

                    {/* Header with Remote Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Job Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {job.JobTitle.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h3>
                        {/* Company */}
                        <p className="text-gray-800 text-sm">
                          {job.Company}
                        </p>
                      </div>

                      {/* Remote Badge */}
                      {job.is_remote && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium border border-green-200 ml-3 flex-shrink-0">
                          Remote
                        </span>
                      )}
                    </div>

                    {/* Location with Icon */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{job.Location}</span>
                    </div>

                    {/* Salary with Icon */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm">{job.formatted_salary || 'Competitive'}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm text-gray-500">
                        Posted {formatPostedDate(job.PostedDate)}
                      </span>
                    </div>

                    {/* Bottom Section - View Details and Posted Time */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                      >
                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>

                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors transform hover:scale-105"
              >
                View All Jobs <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
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