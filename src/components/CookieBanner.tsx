// src/components/CookieBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { pageview } from '@/lib/gtag';

const STORAGE_KEY = 'ga_consent'; // 'granted' | 'denied'

function setCookie(name: string, value: string, days = 180) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true); // only show if no prior choice
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted');
      setCookie(STORAGE_KEY, 'granted');

      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
        pageview(window.location.pathname + window.location.search);
      }
    } finally {
      setVisible(false);
    }
  };

  const reject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'denied');
      setCookie(STORAGE_KEY, 'denied');

      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    } finally {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <div
          className="
            mb-4 rounded-lg bg-white shadow-lg border border-gray-200
            p-4 sm:p-5
            will-change-transform transform transition-transform duration-300 ease-out
          "
          style={{ transform: 'translateY(0)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm leading-5 text-gray-800">
              We use cookies to measure traffic and improve the site. Click <strong>Accept</strong> to allow
              analytics cookies, or <strong>Reject</strong> to continue without them.
            </p>

            <div className="flex gap-2">
              <button
                onClick={reject}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                aria-label="Reject analytics cookies"
              >
                Reject
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:opacity-90"
                aria-label="Accept analytics cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (prefers-reduced-motion: reduce) {
              [role="dialog"] .transition-transform { transition: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
