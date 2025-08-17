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
  const remotePercentage = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Briefcase className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl lg:text-6xl font-bold text-white">
                Six-Figure Career Opportunities
              </h1>
            </div>
            <h2 className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find Your Next
            </h2>
            <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto">
              Discover high-paying opportunities at top companies.{totalJobs.toLocaleString()} active positions waiting for talented professionals like you.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/jobs" 
                className="flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse {totalJobs.toLocaleString()} Jobs
              </Link>
              <Link 
                href="/companies" 
                className="flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <Building2 className="w-5 h-5 mr-2" />
                View Companies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">{totalJobs.toLocaleString()}</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">${Math.round(avgSalary/1000)}K</div>
              <div className="text-gray-600">Avg Salary</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">{totalCompanies}</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">{remotePercentage}%</div>
              <div className="text-gray-600">Remote</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose SixFigHires Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SixFigHires?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in connecting talented professionals with premium career opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Six-Figure Focus</h3>
              <p className="text-gray-600">
                Every position pays $100K+ annually. No time wasted on low-paying opportunities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Companies</h3>
              <p className="text-gray-600">
                Fortune 500s, unicorns, and growing companies that value talent and pay accordingly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Remote Friendly</h3>
              <p className="text-gray-600">
                {remotePercentage}% of our positions offer remote work options for the best work-life balance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Sparkles className="w-8 h-8 inline mr-2 text-yellow-500" />
              Weekly Job Alerts
            </h2>
            <p className="text-xl text-gray-600">
              Get the best six-figure opportunities delivered to your inbox every week
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who've found six-figure careers through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
            >
              Start Your Search
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/companies" 
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Browse Companies
              <Building2 className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}