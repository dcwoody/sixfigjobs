// src/app/api/newsletter/generate-content/route.ts - REVIEWED VERSION
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface JobListing {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  ShortDescription: string;
  PostedDate: string;
  is_remote: boolean;
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.NEWSLETTER_API_SECRET;
    
    if (!authHeader || !expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== expectedSecret) {
      console.log('Auth failed:', { received: token, expected: expectedSecret });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client (await if needed)
    const supabase = await createClient();

    // Get latest jobs for newsletter (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: latestJobs, error } = await supabase
      .from('job_listings_db')
      .select(`
        JobID,
        JobTitle,
        Company,
        Location,
        formatted_salary,
        ShortDescription,
        PostedDate,
        is_remote,
        slug
      `)
      .gte('PostedDate', sevenDaysAgo.toISOString())
      .order('PostedDate', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Get job statistics
    const { count: totalJobs } = await supabase
      .from('job_listings_db')
      .select('*', { count: 'exact', head: true });

    const { count: newJobs } = await supabase
      .from('job_listings_db')
      .select('*', { count: 'exact', head: true })
      .gte('PostedDate', sevenDaysAgo.toISOString());

    // Generate newsletter content
    const newsletter = generateNewsletterHTML(latestJobs || [], { 
      totalJobs: totalJobs || 0, 
      newJobs: newJobs || 0 
    });

    // Log the content generation
    console.log('📝 Newsletter content generated:', {
      jobsFound: latestJobs?.length || 0,
      totalJobs: totalJobs || 0,
      newJobs: newJobs || 0
    });

    return NextResponse.json({
      subject: `Weekly Six-Figure Jobs - ${newJobs || 0} New Opportunities`,
      htmlContent: newsletter,
      jobsData: latestJobs || [],
      stats: { totalJobs: totalJobs || 0, newJobs: newJobs || 0 }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function generateNewsletterHTML(jobs: JobListing[], stats: { totalJobs: number; newJobs: number }): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com';
  
  // Helper function to safely escape HTML
  const escapeHtml = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Six-Figure Jobs</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .stats { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .stat { text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #2563eb; }
    .stat-label { font-size: 14px; color: #64748b; margin-top: 5px; }
    .job-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .job-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .job-company { color: #2563eb; font-weight: 500; margin-bottom: 4px; }
    .job-location { color: #64748b; font-size: 14px; margin-bottom: 8px; }
    .job-salary { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 10px; }
    .job-description { color: #475569; font-size: 14px; line-height: 1.5; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; }
    .no-jobs { text-align: center; padding: 40px 20px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Six-Figure Jobs</h1>
      <p>${currentDate}</p>
    </div>
    
    <div class="content">
      <p>Hello {{firstName}},</p>
      
      <p>Here are this week's best six-figure opportunities curated just for you:</p>
      
      <div class="stats">
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-number">${stats.newJobs}</div>
            <div class="stat-label">New This Week</div>
          </div>
          <div class="stat">
            <div class="stat-number">${stats.totalJobs}</div>
            <div class="stat-label">Total Active Jobs</div>
          </div>
        </div>
      </div>
      
      ${jobs.length > 0 ? jobs.map(job => `
        <div class="job-card">
          <div class="job-title">${escapeHtml(job.JobTitle)}</div>
          <div class="job-company">${escapeHtml(job.Company)}</div>
          <div class="job-location">${escapeHtml(job.Location)}${job.is_remote ? ' (Remote)' : ''}</div>
          ${job.formatted_salary ? `<div class="job-salary">${escapeHtml(job.formatted_salary)}</div>` : ''}
          <div class="job-description">${escapeHtml(job.ShortDescription || '')}</div>
          <a href="${domain}/jobs/${job.slug}" class="cta-button">View Job Details</a>
        </div>
      `).join('') : `
        <div class="no-jobs">
          <h3>No new jobs this week</h3>
          <p>Check back next week for fresh opportunities!</p>
        </div>
      `}
      
      <p>
        <a href="${domain}/jobs" class="cta-button">Browse All Jobs</a>
      </p>
      
      <p>Have a great week ahead!</p>
      <p>The JobBoard Team</p>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you subscribed to our weekly newsletter.</p>
      <p>
        <a href="${domain}/unsubscribe?email={{email}}">Unsubscribe</a> | 
        <a href="${domain}">Visit Website</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}