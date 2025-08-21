// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

import Script from 'next/script';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import Navigation from '@/components/Navigation';
import { SavedJobsProvider } from '@/hooks/useSavedJobs';
import CookieBanner from '@/components/CookieBanner';

// ✅ Add this import
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SixFigJob - Six-Figure Job Opportunities',
  description: 'Discover six-figure job opportunities at top companies across government and non-government industries. Search, save, and apply for your next $100k+ career!',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="SixFigJob.com - Find Six-Figure Careers" />
        <meta property="og:description" content="Search and apply for six-figure jobs at top companies. Save your favorites and grow your career with SixFigJob.com." />
        <meta property="og:url" content="https://sixfigjob.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sixfigjob.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SixFigJob.com - Find Six-Figure Careers" />
        <meta name="twitter:description" content="Explore six-figure jobs across industries and top employers. Apply today and take your career to the next level." />
        <meta name="twitter:image" content="https://sixfigjob.com/og-image.jpg" />
      </head>
      <body className={inter.className}>
        {process.env.NODE_ENV === 'production' && GA_ID ? (
          <>
            <Script
              id="ga4-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  wait_for_update: 500
                });

                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}

        {/* ✅ Wrap components that use useSearchParams in Suspense */}
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
