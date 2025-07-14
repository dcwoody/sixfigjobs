'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Job {
  JobID: string;
  JobTitle: string;
  LongDescription: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  Industry: string;
  JobType: string;
  SubmissionDate: string;
  ExpirationDate: string;
  CompanyLogo: string;
  "Related Submissions": string;
  PostedDate: string;
  is_remote: boolean;
  Interval: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  source: string;
  formatted_salary: string;
  job_url: string;
  job_url_direct: string;
  CreatedTime: string;
  is_duplicate: boolean;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('jobs_db').select('*')
      console.log('Fetch response:', { data, error })

      if (error) {
        console.error('Error fetching jobs:', error.message)
        setError(error.message)
        setJobs([])
      } else {
        setJobs(data || [])
      }

      setLoading(false)
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job =>
    job.JobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-4 text-center">Loading...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">SixFigHires</h1>

      <input
        type="text"
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

      {/* Optional: Add your subscription form here */}
      {/* <SubscribeForm /> */}

      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <div key={job.JobID} className="p-4 border rounded shadow-sm">
            <h2 className="text-xl font-semibold">{job.JobTitle}</h2>
            <p className="text-gray-600">{job.Company} — {job.Location}</p>
            <p className="my-2">{job.ShortDescription || job.LongDescription}</p>
            <a
              href={job.job_url || job.job_url_direct}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Apply Now →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
