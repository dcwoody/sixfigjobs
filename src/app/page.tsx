// src/app/page.tsx - Fixed TypeScript errors
import React from 'react';
import Link from 'next/link';
import { Search, MapPin, TrendingUp, Users, Building2, DollarSign, Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import NewsletterSignup from '@/components/NewsletterSignup';

// Define interface for job data
interface JobData {
  formatted_salary?: string;
  is_remote?: boolean;
}

export default async function HomePage() {
  // Get real stats from your database
  const [jobsData, companiesData] = await Promise.all([
    supabase.from('job_listings_db').select('formatted_salary, is_remote', { count: 'exact' }),
    supabase.from('company_db').select('*', { count: 'exact' })
  ]);

  const totalJobs = jobsData.count || 0;
  const totalCompanies = companiesData.count || 0;

  // Calculate average salary from real data with proper typing
  const salaries = jobsData.data?.filter((job: JobData) => job.formatted_salary).map((job: JobData) => {
    const salary = job.formatted_salary!.replace(/[^\d]/g, '');
    return parseInt(salary);
  }).filter((salary: number) => salary > 50000) || [];

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a: number, b: number) => a + b, 0) / salaries.length)
    : 150000;

  const remoteJobs = jobsData.data?.filter((job: JobData) => job.is_remote).length || 0;
  const remotePercentage = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                Six-Figure Career Opportunities
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Find Your Next
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                $100K+ Job
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Discover high-paying opportunities at top companies. 
              <span className="text-blue-600 font-semibold">{totalJobs.toLocaleString()} active positions</span> 
              waiting for talented professionals like you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/jobs" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse {totalJobs.toLocaleString()} Jobs
              </Link>
              <Link 
                href="/companies" 
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 border-gray-200 hover:border-blue-300 flex items-center justify-center"
              >
                <Building2 className="w-5 h-5 mr-2" />
                View Companies
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{totalJobs.toLocaleString()}</div>
                <div className="text-gray-600 font-medium">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">${(avgSalary / 1000).toFixed(0)}K</div>
                <div className="text-gray-600 font-medium">Avg Salary</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{totalCompanies}</div>
                <div className="text-gray-600 font-medium">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{remotePercentage}%</div>
                <div className="text-gray-600 font-medium">Remote</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SixFigHires?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in connecting talented professionals with premium career opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Six-Figure Focus</h3>
              <p className="text-gray-700 leading-relaxed">
                Every position pays $100K+ annually. No time wasted on low-paying opportunities.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Top Companies</h3>
              <p className="text-gray-700 leading-relaxed">
                Fortune 500s, unicorns, and growing companies that value talent and pay accordingly.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Remote Friendly</h3>
              <p className="text-gray-700 leading-relaxed">
                {remotePercentage}% of our positions offer remote work options for the best work-life balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                Weekly Job Alerts
              </span>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Never Miss a Six-Figure Opportunity
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get hand-picked $100K+ jobs delivered to your inbox every Monday morning
            </p>
            
            <NewsletterSignup />
            
            <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Free forever</span>
              <span className="mx-4">•</span>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Unsubscribe anytime</span>
              <span className="mx-4">•</span>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>No spam</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Next Career Move Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of professionals who've found their dream six-figure jobs
          </p>
          <Link 
            href="/jobs" 
            className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Start Your Search
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}