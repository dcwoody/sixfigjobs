// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

import Script from 'next/script';
import AnalyticsProvider from '@/components/AnalyticsProvider';

import Navigation from '@/components/Navigation';
import { SavedJobsProvider } from '@/hooks/useSavedJobs';
import CookieBanner from '@/components/CookieBanner'; // ⬅️ NEW

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SixFigHires - Six-Figure Job Opportunities',
  description: 'Find your next six-figure career opportunity at top companies.',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* GA4 scripts: only load in prod and when GA_ID is set */}
        {process.env.NODE_ENV === 'production' && GA_ID ? (
          <>
            <Script
              id="ga4-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                // DataLayer + gtag bootstrap
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                // Consent Mode v2 - start everything denied
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  wait_for_update: 500
                });

                // Init GA4 but disable auto page_view (we track SPA views manually)
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}

        {/* Tracks SPA route changes */}
        <AnalyticsProvider />

        <SavedJobsProvider>
          <Navigation />
          <main>{children}</main>
        </SavedJobsProvider>

        {/* Cookie banner (only shows on /login and if not decided) */}
        <CookieBanner />
      </body>
    </html>
  );
}
