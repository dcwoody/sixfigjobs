import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('job_listings_db')
    .select('JobID, JobTitle, Company, Location, slug')
    .limit(5)

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  const suggestions = data.map((job) => ({
    id: job.JobID,
    title: job.JobTitle,
    company: job.Company,
    location: job.Location,
    url: `/jobs/${job.slug}`,
    matchScore: 0.5
  }))

  return NextResponse.json({ suggestions })
}
