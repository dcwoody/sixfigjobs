// src/app/layout.tsx - ORIGINAL WORKING VERSION
import type { Metadata } from 'next';
import '@/app/global.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SavedJobsProvider } from '@/hooks/useSavedJobs';

export const metadata: Metadata = {
  title: 'SixFigHires - Premium Job Board',
  description: 'Find six-figure career opportunities with top companies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SavedJobsProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </SavedJobsProvider>
      </body>
    </html>
  );
}