'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider'; // Ensure you have this
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="flex justify-between items-center p-6 px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/img/logo.svg"
            alt="SixFigJobs.com Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Auth Links */}
        <div className="hidden xl:flex items-center space-x-4">
          {session ? (
            <button
              onClick={handleSignOut}
              className="py-2 px-4 text-gray-600 hover:text-gray-900 font-medium rounded-md"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="py-2 px-4 text-gray-600 hover:text-gray-900 font-medium rounded-md"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="py-2 px-4 text-white bg-green-500 hover:bg-green-600 font-medium rounded-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Burger */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="xl:hidden p-2"
          aria-label="Open menu"
        >
          <svg width="35" height="35" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#f9fafb" />
            <path d="M7 12H25M7 16H25M7 20H25" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <aside className="fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-xl flex flex-col justify-between p-6">
            {/* Top Section */}
            <div>
              <Link href="/" onClick={() => setMobileNavOpen(false)}>
                <Image
                  src="/img/logo.svg"
                  alt="SixFigJobs.com Logo"
                  width={120}
                  height={40}
                  className="mb-6"
                />
              </Link>
              <ul className="space-y-4">
                {['Product', 'Features', 'Pricing', 'Resources'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="block py-2 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auth Section */}
            <div className="space-y-3">
              {session ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileNavOpen(false);
                  }}
                  className="w-full py-2 px-4 text-center text-gray-600 hover:text-gray-900 font-medium rounded-md"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="block w-full py-2 px-4 text-center text-gray-600 hover:text-gray-900 font-medium rounded-md"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileNavOpen(false)}
                    className="block w-full py-2 px-4 text-center text-white bg-green-500 hover:bg-green-600 font-medium rounded-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-5 right-4 text-gray-600 hover:text-gray-800"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 4L16 16M4 16L16 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </aside>
        </div>
      )}
    </header>
  );
}
