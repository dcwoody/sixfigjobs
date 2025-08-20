// src/components/CookieBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { pageview } from '@/lib/gtag';

const STORAGE_KEY = 'ga_consent'; // 'granted' | 'denied'

function setCookie(name: string, value: string, days = 180) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // no prior choice → show banner
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted');
      setCookie(STORAGE_KEY, 'granted');

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // Allow analytics cookies only
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });

        // Fire a pageview immediately so session counts
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

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // Explicitly deny everything
        window.gtag('consent', 'update', {
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
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 p-4 shadow-lg border-t bg-white">
      <div className="text-sm leading-5">
        We use cookies to measure traffic and improve the site. Click <strong>Accept</strong> to allow
        analytics cookies, or <strong>Reject</strong> to continue without them.
      </div>
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
  );
}
