// src/components/Navigation.tsx - TEMPORARY SIMPLE VERSION
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('Simple Navigation - User:', session?.user?.email || 'None');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      console.log('Simple Navigation - Auth changed:', event, session?.user?.email || 'None');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          SixFigJob.com
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/jobs" className="text-gray-700 hover:text-blue-600">Jobs</Link>
          <Link href="/companies" className="text-gray-700 hover:text-blue-600">Companies</Link>
          
          {/* Auth Section */}
          {loading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {user.email?.split('@')[0]}
              </span>
              <Link
                href="/welcome"
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}