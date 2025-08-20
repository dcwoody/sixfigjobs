// src/app/page.tsx - Complete Server Component with Navigation, Featured Jobs, and Footer
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { 
  Search, MapPin, TrendingUp, Clock, Building2, DollarSign, 
  Star, ArrowRight, CheckCircle, Sparkles, Globe, Briefcase,
  Users, Award, Zap
} from 'lucide-react';
import Footer from '@/components/Footer';
import NewsletterSignup from '@/components/NewsletterSignup';
import JobDirectory from '@/components/JobDirectory';

// Enable ISR with revalidation
export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const supabase = await createClient();

  // Get real stats from your database in parallel
  const [jobsResult, companiesResult, featuredJobsResult] = await Promise.all([
    supabase
      .from('job_listings_db')
      .select('formatted_salary, is_remote', { count: 'exact' }),
    
    supabase
      .from('full_company_db') // Updated to match your CSV file
      .select('*', { count: 'exact' }),
    
    // Get featured jobs - fetch more to filter from
    supabase
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
      .limit(12) // Get more to filter from
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

  // Create featured jobs selection (ensure we have at least one remote job)
  const allFeaturedJobs = featuredJobsResult.data || [];
  const remoteJobsForFeatured = allFeaturedJobs.filter((job: any) => job.is_remote);
  const nonRemoteJobsForFeatured = allFeaturedJobs.filter((job: any) => !job.is_remote);

  let featuredJobs: any[] = [];
  if (remoteJobsForFeatured.length > 0) {
    featuredJobs.push(remoteJobsForFeatured[0]);
    const remainingJobs = [...remoteJobsForFeatured.slice(1), ...nonRemoteJobsForFeatured];
    featuredJobs.push(...remainingJobs.slice(0, 3));
  } else {
    featuredJobs = allFeaturedJobs.slice(0, 4);
  }

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

  // Format posted date helper
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

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
                Find Your Next
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Six-Figure Career
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
        <section id="featured-jobs" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full px-6 py-2 mb-6">
                <Star className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-600 font-medium">Hand-picked for you</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured Opportunities</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Premium positions from our top partner companies with competitive salaries and great benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredJobs.map((job: any) => (
                <div key={job.JobID} className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-blue-200">
                  <div className="p-6">
                    {/* Company and Remote Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 truncate">{job.Company}</span>
                      </div>
                      {job.is_remote && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          Remote
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <Link href={`/jobs/${job.slug}`} className="block mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {job.JobTitle}
                      </h3>
                    </Link>

                    {/* Location and Salary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{job.Location}</span>
                      </div>
                      {job.formatted_salary && (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium">{job.formatted_salary}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {job.ShortDescription}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">{formatPostedDate(job.PostedDate)}</span>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                        {job.JobType}
                      </span>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors transform hover:scale-105 shadow-lg"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                View All {totalJobs.toLocaleString()} Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
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