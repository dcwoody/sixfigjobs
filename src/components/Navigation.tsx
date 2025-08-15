// src/components/Navigation.tsx - USING GLOBAL AUTH CONTEXT
'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getUserName = () => {
    if (!user?.email) return 'User';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">
              SixFigJob.com
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/jobs" 
              className={`font-medium transition-colors ${
                pathname.startsWith('/jobs') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Jobs
            </Link>
            <Link 
              href="/companies" 
              className={`font-medium transition-colors ${
                pathname.startsWith('/companies') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Companies
            </Link>
            
            {/* Auth Section */}
            {loading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Debug info - remove after testing */}
                <div className="bg-green-100 px-2 py-1 rounded text-xs">
                  LOGGED IN: {user.email?.split('@')[0]}
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getUserName()}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <Link
                  href="/welcome"
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/welcome'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Debug info */}
                <div className="bg-red-100 px-2 py-1 rounded text-xs">
                  NOT LOGGED IN
                </div>
                
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}