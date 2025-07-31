'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

const Hero = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <section className="bg-white">
      <nav className="flex justify-between p-6 px-4">
        <div className="flex justify-between items-center w-full">
          <div className="xl:w-1/3">
            <Link href="/">
              <Image
                className="h-8"
                src="/img/logo.svg"
                alt="SixFigJobs.com Logo"
                width={120}
              />
            </Link>
          </div>
          <div className="hidden xl:block xl:w-1/3">
            <div className="flex items-center justify-end">
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="py-2 px-4 mr-2 leading-5 text-gray-500 hover:text-gray-900 font-medium rounded-md"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="py-2 px-4 mr-2 leading-5 text-gray-500 hover:text-gray-900 font-medium rounded-md"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="py-2 px-4 text-sm leading-5 text-white bg-green-500 hover:bg-green-600 font-medium rounded-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="navbar-burger self-center xl:hidden"
        >
          <svg width="35" height="35" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="currentColor" className="text-gray-100" />
            <path
              d="M7 12H25M7 16H25M7 20H25"
              stroke="currentColor"
              className="text-gray-500"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileNavOpen && (
        <div className="navbar-menu fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50">
          <div className="fixed top-0 left-0 bottom-0 w-4/6 max-w-xs bg-white">
            <nav className="relative p-6 h-full overflow-y-auto flex flex-col justify-between">
              <div>
                <Link className="inline-block mb-6" href="/">
                  <Image
                    className="h-8"
                    src="/flex-ui-assets/logos/flex-ui-green-light.svg"
                    alt="Logo"
                    width={120}
                    height={40}
                  />
                </Link>
                <ul className="py-6">
                  {['Product', 'Features', 'Pricing', 'Resources'].map((item) => (
                    <li key={item}>
                      <a
                        className="block py-3 px-4 text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-md"
                        href="#"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap">
                {session ? (
                  <div className="w-full mb-2">
                    <button
                      onClick={handleSignOut}
                      className="block py-2 px-4 w-full text-sm text-center text-gray-500 hover:text-gray-900 font-medium rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-full mb-2">
                      <Link
                        href="/login"
                        className="block py-2 px-4 w-full text-sm text-center text-gray-500 hover:text-gray-900 font-medium rounded-md"
                      >
                        Log In
                      </Link>
                    </div>
                    <div className="w-full">
                      <Link
                        href="/signup"
                        className="block py-2 px-4 w-full text-sm text-center text-white bg-green-500 hover:bg-green-600 font-medium rounded-md"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </nav>

            <button
              onClick={() => setMobileNavOpen(false)}
              className="navbar-close absolute top-5 right-3 p-4"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.94 6L11.14 1.80667C11.266 1.68113 11.3361 1.51087 11.3361 1.33333C11.3361 1.1558 11.266 0.985537 11.14 0.860002C11.0145 0.734466 10.8442 0.66394 10.6667 0.66394C10.4892 0.66394 10.3189 0.734466 10.1934 0.860002L6 5.06L1.80671 0.860002C1.68117 0.734466 1.51091 0.663941 1.33337 0.663941C1.15584 0.663941 0.985576 0.734466 0.860041 0.860002C0.734505 0.985537 0.66398 1.1558 0.66398 1.33333C0.66398 1.51087 0.734505 1.68113 0.860041 1.80667L5.06 6L0.860041 10.1933C0.797555 10.2553 0.747959 10.329 0.714113 10.4103C0.680267 10.4915 0.662842 10.5787 0.662842 10.6667C0.662842 10.7547 0.680267 10.8418 0.714113 10.9231C0.747959 11.0043 0.797555 11.078 0.860041 11.14C0.922016 11.2025 0.99575 11.2521 1.07699 11.2859C1.15823 11.3198 1.24537 11.3372 1.33337 11.3372C1.42138 11.3372 1.50852 11.3198 1.58976 11.2859C1.671 11.2521 1.74473 11.2025 1.80671 11.14L6 6.94L10.1934 11.14C10.2554 11.2025 10.3291 11.2521 10.4103 11.2859C10.4916 11.3198 10.5787 11.3372 10.6667 11.3372C10.7547 11.3372 10.8419 11.3198 10.9231 11.2859C11.0043 11.2521 11.0781 11.2025 11.14 11.14C11.2025 11.078 11.2521 11.0043 11.286 10.9231C11.3198 10.8418 11.3372 10.7547 11.3372 10.6667C11.3372 10.5787 11.3198 10.4915 11.286 10.4103C11.2521 10.329 11.2025 10.2553 11.14 10.1933L6.94 6Z"
                  fill="#556987"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
