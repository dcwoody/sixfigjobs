// src/app/layout.tsx - With SavedJobsProvider
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './global.css'
import Navigation from '@/components/Navigation'
import { SavedJobsProvider } from '@/hooks/useSavedJobs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SixFigHires - Six-Figure Job Opportunities',
  description: 'Find your next six-figure career opportunity at top companies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SavedJobsProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </SavedJobsProvider>
      </body>
    </html>
  )
}