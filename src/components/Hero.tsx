'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Search, Menu, X, Briefcase, } from 'lucide-react';

const Hero = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { session } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Handle logo click explicitly
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const navigationLinks = [
    { name: 'Browse Jobs', href: '/jobs', icon: Briefcase },
  //  { name: 'Companies', href: '/company', icon: Building2 },
//    { name: 'About', href: '/about', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex-shrink-0 cursor-pointer"
              onClick={handleLogoClick}
            >
              <Image
                className="h-8 w-auto"
                src="/img/logo.svg"
                alt="SixFigJobs.com Logo"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center text-gray-700 hover:text-[#31C7FF] font-medium transition-colors duration-200"
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 placeholder-gray-500"
                />
              </div>
            </form>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-[#31C7FF] font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-[#31C7FF] hover:bg-[#28B4E6] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Link
              href="/jobs"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#31C7FF] focus:border-transparent outline-none text-gray-700 placeholder-gray-500"
              />
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileNavOpen(false)} />
          
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Link 
                href="/" 
                className="flex-shrink-0" 
                onClick={(e) => {
                  handleLogoClick(e);
                  setMobileNavOpen(false);
                }}
              >
                <Image
                  className="h-8 w-auto"
                  src="/img/logo.svg"
                  alt="SixFigJobs.com Logo"
                  width={120}
                  height={32}
                />
              </Link>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Mobile Navigation */}
              <nav className="space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center text-gray-700 hover:text-[#31C7FF] font-medium transition-colors duration-200 py-2"
                  >
                    <link.icon className="w-5 h-5 mr-3" />
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth */}
              <div className="border-t border-gray-200 pt-6">
                {session ? (
                  <div className="space-y-4">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileNavOpen(false)}
                      className="block text-gray-700 hover:text-[#31C7FF] font-medium transition-colors duration-200 py-2"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileNavOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 py-2"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileNavOpen(false)}
                      className="block w-full text-center bg-[#31C7FF] hover:bg-[#28B4E6] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Quick Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/jobs?location=remote"
                    onClick={() => setMobileNavOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#31C7FF] transition-colors py-1"
                  >
                    Remote Jobs
                  </Link>
                  <Link
                    href="/jobs?q=senior"
                    onClick={() => setMobileNavOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#31C7FF] transition-colors py-1"
                  >
                    Senior Positions
                  </Link>
                  <Link
                    href="/jobs"
                    onClick={() => setMobileNavOpen(false)}
                    className="block text-sm text-gray-600 hover:text-[#31C7FF] transition-colors py-1"
                  >
                    All Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Hero;