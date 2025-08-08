// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/app/global.css';
import Navigation from '@/components/Navigation';

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
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}