// src/app/page.tsx - Professional Home Page
import React from 'react';
import Link from 'next/link';
import { Search, MapPin, TrendingUp, Users, Building2, DollarSign, Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
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
  const salaries = jobsData.data?.filter(job => job.formatted_salary).map(job => {
    const salary = job.formatted_salary.replace(/[^\d]/g, '');
    return parseInt(salary);
  }).filter(salary => salary > 50000) || [];

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
    : 150000;

  const remoteJobs = jobsData.data?.filter(job => job.is_remote).length || 0;
  const remotePercentage = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;

  // Get featured jobs
  const { data: featuredJobs } = await supabase
    .from('job_listings_db')
    .select('*')
    .order('PostedDate', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">There are currently {totalJobs.toLocaleString()}+ $100k Opportunities</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Six-Figure
              </span>
              <br />
              <span className="text-gray-900">Career Opportunities</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredJobs.map((job: any) => (
                <div key={job.JobID} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-200 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {job.Company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {job.is_remote && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Remote
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {job.JobTitle}
                  </h3>
                  <p className="text-blue-600 font-medium mb-4">{job.Company}</p>

                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.Location}
                  </div>

                  <div className="flex items-center text-green-600 font-bold text-lg mb-4">
                    <DollarSign className="w-5 h-5" />
                    {job.formatted_salary || 'Competitive'}
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-3">{job.ShortDescription}</p>

                  <Link
                    href={`/jobs/${job.slug}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              ))}
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

      {/* Newsletter Signup - ADD THIS */}
      <NewsletterSignup />

    </div>
  );
}