// src/components/Navigation.tsx - Enhanced with Sign Out Notification
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Menu, X, User, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutSuccess, setShowSignOutSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Get initial user and set up auth listener
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Navigation auth error:', error);
        }

        if (mounted) {
          setUser(session?.user ?? null);
          
          // Fetch user profile if we have a user
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Navigation initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Navigation auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_db')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
      } else {
        console.log('No user profile found, user might be new');
      }
    } catch (error) {
      console.error('Error fetching user profile in navigation:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      
      // Show signing out state for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setSigningOut(false);
        return;
      }
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      setSigningOut(false);
      
      // Show success message
      setShowSignOutSuccess(true);
      
      // Hide success message and redirect after 3 seconds
      setTimeout(() => {
        setShowSignOutSuccess(false);
        // Force a hard refresh to clear any cached state
        window.location.href = '/';
      }, 3000);
      
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  // Get user display name with priority: profile name > metadata name > email
  const getUserDisplay = () => {
    if (!user) return '';
    
    // Try user profile first
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    
    // Try user metadata
    if (user.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    
    // Fall back to email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'User';
  };

  return (
    <>
      {/* Sign Out Success Overlay */}
      {showSignOutSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-lg p-8 mx-4 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Signed Out Successfully
            </h3>
            <p className="text-gray-600 text-sm">
              You have been safely signed out. Redirecting to home page...
            </p>
          </div>
        </div>
      )}

      {/* Sign Out Loading Overlay */}
      {signingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-lg p-8 mx-4 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Signing Out
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we sign you out safely...
            </p>
          </div>
        </div>
      )}

      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                SixFigJob.com
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {user ? (
                <>
                  {/* Logged in users see Jobs and Companies */}
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
                </>
              ) : null}
              
              {/* About link for everyone */}
              <Link 
                href="/about" 
                className={`font-medium transition-colors ${
                  pathname.startsWith('/about') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
              </Link>
              
              {loading ? (
                <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{getUserDisplay()}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link
                        href="/welcome"
                        className={`flex items-center px-4 py-2 transition-colors rounded-t-lg ${
                          pathname === '/welcome' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className={`flex items-center px-4 py-2 transition-colors ${
                          pathname === '/profile' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <hr className="border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className={`w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors rounded-b-lg ${
                          signingOut ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {signingOut ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-logged in users see Sign In and Sign Up */
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && (
                <>
                  <Link
                    href="/jobs"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname.startsWith('/jobs')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Jobs
                  </Link>
                  <Link
                    href="/companies"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname.startsWith('/companies')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Companies
                  </Link>
                </>
              )}
              
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname.startsWith('/about')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {loading ? (
                <div className="px-3 py-2">
                  <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md"></div>
                </div>
              ) : user ? (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-2">
                    <p className="text-sm text-gray-500 mb-1">Signed in as</p>
                    <p className="font-medium text-gray-900">{getUserDisplay()}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/welcome"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === '/welcome'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === '/profile'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={signingOut}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors ${
                      signingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}