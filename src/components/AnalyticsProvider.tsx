// src/components/AnalyticsProvider.tsx - Optimized version
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/gtag';

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  // Load Google Analytics script with delay
  useEffect(() => {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    if (!GA_ID) return;

    const loadGoogleAnalytics = () => {
      if (typeof window === 'undefined' || analyticsLoaded) return;

      // Create and append the GA script
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Initialize gtag using your existing pattern
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID, {
          // Optimize GA loading
          send_page_view: false, // We'll handle pageviews manually
          allow_google_signals: false, // Reduce data collection for performance
          allow_ad_personalization_signals: false,
        });
        
        setAnalyticsLoaded(true);
      };

      document.head.appendChild(script);
    };

    // Delay analytics loading to prioritize critical resources
    const loadTimer = setTimeout(loadGoogleAnalytics, 2000);

    // Load immediately on user interaction
    const handleInteraction = () => {
      clearTimeout(loadTimer);
      loadGoogleAnalytics();
      // Remove listeners after first interaction
      ['click', 'scroll', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    // Add interaction listeners
    ['click', 'scroll', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      clearTimeout(loadTimer);
      ['click', 'scroll', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [analyticsLoaded]);

  // Track pageviews using your existing pageview function
  useEffect(() => {
    if (!pathname || !analyticsLoaded) return;
    
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;
    
    // Small delay to ensure GA is fully initialized
    setTimeout(() => {
      pageview(url);
    }, 100);
  }, [pathname, searchParams, analyticsLoaded]);

  return null;
}