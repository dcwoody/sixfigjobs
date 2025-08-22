// src/app/layout.tsx - Remove duplicate GA loading
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import Navigation from '@/components/Navigation';
import { SavedJobsProvider } from '@/hooks/useSavedJobs';
import CookieBanner from '@/components/CookieBanner';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SixFigJob - Six-Figure Job Opportunities',
  description:
    'Discover six-figure job opportunities at top companies across government and non-government industries. Search, save, and apply for your next $100k+ career!',
  metadataBase: new URL('https://www.sixfigjob.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Critical CSS - inline styles for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical styles for immediate paint */
            body { margin: 0; padding: 0; font-family: var(--font-inter), system-ui, -apple-system, sans-serif; }
            
            /* Navigation critical styles */
            .nav-container { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              padding: 1rem 2rem; 
              background: white; 
              border-bottom: 1px solid #e5e7eb; 
              position: relative;
              z-index: 50;
            }
            
            /* Hero section critical styles */
            .hero-gradient { 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%);
              min-height: 70vh;
              position: relative;
            }
            
            .hero-content { 
              color: white; 
              padding: 6rem 1rem 4rem; 
              max-width: 1200px; 
              margin: 0 auto;
            }
            
            .hero-title {
              font-size: 3rem;
              font-weight: 700;
              line-height: 1.1;
              margin-bottom: 1.5rem;
            }
            
            .search-card {
              background: white;
              border-radius: 0.75rem;
              padding: 1rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            /* Grid layout for featured jobs */
            .jobs-grid { 
              display: grid; 
              gap: 1.25rem;
              margin-top: 2rem;
            }
            
            /* Loading state */
            .loading-spinner {
              border: 3px solid #f3f4f6;
              border-radius: 50%;
              border-top: 3px solid #3b82f6;
              width: 2rem;
              height: 2rem;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
              .hero-title { font-size: 2.5rem; }
              .hero-content { padding: 4rem 1rem 2rem; }
              .nav-container { padding: 1rem; }
            }
            
            @media (min-width: 1024px) {
              .hero-title { font-size: 4rem; }
            }
            
            /* Prevent layout shift */
            .job-card { min-height: 180px; }
            .featured-section { min-height: 400px; }
          `
        }} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/img/2.jpg" as="image" />
        <link rel="preload" href="/img/1.jpg" as="image" />
        <link rel="dns-prefetch" href="//your-supabase-url.supabase.co" />
      </head>
      <body>
        {/* Use ONLY the optimized AnalyticsProvider - remove Script tags */}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>

        <SavedJobsProvider>
          <Navigation />
          <main>{children}</main>
        </SavedJobsProvider>

        <CookieBanner />
      </body>
    </html>
  );
}