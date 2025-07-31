// src/app/layout.tsx
import { AuthProvider } from '@/components/AuthProvider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Six Fig Hires – 100K+ Jobs',
    template: '%s | Six Fig Hires',
  },
  description: 'Discover high-paying curated jobs paying $100K+ from top companies and more – updated daily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
