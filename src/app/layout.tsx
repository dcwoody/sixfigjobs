// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/app/global.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthContext';
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
        <AuthProvider>
          <SavedJobsProvider>
            <Navigation />
            <main>{children}</main>
            <Footer />
          </SavedJobsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}