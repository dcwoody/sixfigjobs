// src/app/page.tsx
'use client';

import MainLayout from '@/components/MainLayout';
import FeaturedJobs from '@/components/FeaturedJobs';
//import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, TrendingUp, Users, Building2, ArrowRight, Briefcase, DollarSign, Mail, CheckCircle } from 'lucide-react';

export default function Home() {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (jobQuery.trim()) params.set('q', jobQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());

    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
      // Add your newsletter signup logic here
    }
  };

  const popularSearches = [
    { title: 'Remote Software Engineer', job: 'Software Engineer', location: 'Remote' },
    { title: 'Product Manager', job: 'Product Manager', location: '' },
    { title: 'Data Scientist SF', job: 'Data Scientist', location: 'San Francisco' },
    { title: 'DevOps Engineer', job: 'DevOps Engineer', location: 'Remote' }
  ];

  const stats = [
    { label: 'Active Jobs', value: '12,500+', icon: Briefcase },
    { label: 'Companies Hiring', value: '2,800+', icon: Building2 },
    { label: 'Successful Placements', value: '3,000+', icon: Users },
    { label: 'Average Salary', value: '$125k', icon: DollarSign }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap xl:items-center -mx-4">
              {/* Left content */}
              <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border mb-6">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#31C7FF]" />
                  <span className="text-sm font-medium text-gray-700">Over 500 new jobs this week</span>
                </div>
                
                <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                  Six-Figure Careers,<br />
                  <span className="text-[#31C7FF]">One Click Away</span>
                </h1>
                
                <p className="mb-8 text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
                  Connect with premium opportunities from top-tier companies. Access curated roles paying $100K+ with transparent salaries and streamlined applications.
                </p>
                
                <div className="flex flex-wrap">
                  <div className="w-full md:w-auto py-1 md:py-0 md:mr-4">
                    <Link href="/jobs" className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-white font-medium text-center bg-[#31C7FF] hover:bg-[#28B4E6] rounded-md shadow-sm transition-all duration-200 hover:shadow-lg">
                      Browse Premium Jobs
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </Link>
                  </div>
                  <div className="w-full md:w-auto py-1 md:py-0">
                    <Link href="/how-it-works" className="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-gray-800 font-medium text-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm transition-all duration-200">
                      How It Works
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right content - Stats Card */}
              <div className="w-full md:w-1/2 px-4">
                <div className="relative mx-auto md:mr-0 max-w-max">
                  <div className="absolute -top-4 -right-4 w-72 h-72 bg-[#31C7FF] rounded-full opacity-20"></div>
                  <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-gray-200 rounded-full opacity-40"></div>
                  
                  <div className="relative bg-white rounded-2xl shadow-2xl p-8 border">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Live Job Stats</h3>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                      {stats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <stat.icon className="w-5 h-5 mr-3 text-gray-400" />
                            <span className="text-gray-600">{stat.label}</span>
                          </div>
                          <span className="font-bold text-gray-900">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search Section */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={jobQuery}
                    onChange={(e) => setJobQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="City, state, or 'remote'"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 text-lg"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-medium">Popular:</span>
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setJobQuery(search.job);
                        setLocationQuery(search.location);
                      }}
                      className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {search.title}
                    </button>
                  ))}
                </div>
                
                <button 
                  type="submit" 
                  className="px-8 py-4 text-white font-semibold rounded-xl bg-[#31C7FF] hover:bg-[#28B4E6] transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
                >
                  Search Jobs
                  <Search className="w-5 h-5 ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#31C7FF]/20 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-[#31C7FF]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-[#31C7FF]">Premium Jobs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked opportunities from top companies, updated daily with transparent salaries
            </p>
          </div>

          {/* Use your existing FeaturedJobs component */}
          <FeaturedJobs />

          <div className="text-center mt-12">
            <Link href="/jobs" className="inline-block px-8 py-4 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 bg-white">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-[#31C7FF]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#31C7FF]/20 rounded-full mb-6">
              <Mail className="w-8 h-8 text-[#31C7FF]" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Never Miss a Premium Opportunity
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get weekly alerts for six-figure jobs matching your skills. Join 50,000+ professionals already subscribed.
            </p>

            {subscribed ? (
              <div className="flex items-center justify-center text-green-600 font-semibold">
                <CheckCircle className="w-6 h-6 mr-2" />
                Successfully subscribed! Check your email for confirmation.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your professional email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700"
                />
                <button 
                  type="submit"
                  className="px-8 py-4 text-white font-semibold rounded-xl bg-[#31C7FF] hover:bg-[#28B4E6] transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                >
                  Get Job Alerts
                </button>
              </form>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}