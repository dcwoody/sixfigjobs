// src/components/Navigation.tsx - EMERGENCY SIMPLE VERSION
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🚨 Navigation: Starting...');
    
    // Simple auth check
    const checkAuth = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('🚨 Navigation: Session check result:', session?.user?.email || 'No user');
        setUser(session?.user ?? null);
        setLoading(false);
      });
    };

    // Initial check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🚨 Navigation: Auth changed:', event, session?.user?.email || 'No user');
      setUser(session?.user ?? null);
    });

    // BROWSER BACK BUTTON FIX: Re-check auth when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🚨 Navigation: Page visible - rechecking auth');
        checkAuth();
      }
    };

    // BROWSER BACK BUTTON FIX: Re-check auth when window gets focus
    const handleFocus = () => {
      console.log('🚨 Navigation: Window focus - rechecking auth');
      checkAuth();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getUserName = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  console.log('🚨 Navigation: Rendering - Loading:', loading, 'User:', user?.email || 'None');

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
            {/* Auth Section - ALWAYS show something */}
            {loading ? (
              <div className="bg-yellow-100 px-3 py-1 rounded text-sm">
                Loading...
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Show user is logged in */}
                <div className="bg-green-100 px-2 py-1 rounded text-sm">
                  ✓ {getUserName()}
                </div>
                
                <Link
                  href="/welcome"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Show user is NOT logged in */}
                <div className="bg-red-100 px-2 py-1 rounded text-sm">
                  ✗ Not logged in
                </div>
                
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </Link>
                
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}