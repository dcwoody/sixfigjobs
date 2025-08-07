'use client';
'use strict';

//import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState as useClientState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useClientState('');
  const [subscribed, setSubscribed] = useClientState(false);

  // Add this if you're sure it's caused by client-only state change
  useEffect(() => {
    // Just to enforce that form doesn't pre-render client state
  }, []);

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  return (
    <>
      {/* Using key to force client-only rendering */}
      <div key={subscribed ? 'subscribed' : 'form'}>
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
      </div>
    </>
  );
}
