// src/app/api/newsletter/test/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TestJob {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  ShortDescription: string;
  is_remote: boolean;
  slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes(process.env.NEWSLETTER_API_SECRET || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testEmail, testType } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email required' }, { status: 400 });
    }

    if (testType === 'welcome') {
      // Test welcome email
      const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/api/newsletter/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, firstName: 'Test User' })
      });

      return NextResponse.json({ 
        success: response.ok,
        message: 'Welcome email test sent'
      });
    }

    if (testType === 'newsletter') {
      // Generate test newsletter with sample data
      const sampleJobs: TestJob[] = [
        {
          JobID: 'test-1',
          JobTitle: 'Senior Software Engineer',
          Company: 'TechCorp Inc.',
          Location: 'San Francisco, CA',
          formatted_salary: '$150K-$200K',
          ShortDescription: 'Build scalable systems for millions of users.',
          is_remote: true,
          slug: 'senior-software-engineer-techcorp'
        },
        {
          JobID: 'test-2',
          JobTitle: 'Product Manager',
          Company: 'InnovateCo',
          Location: 'New York, NY',
          formatted_salary: '$140K-$180K',
          ShortDescription: 'Lead product strategy for our flagship platform.',
          is_remote: false,
          slug: 'product-manager-innovateco'
        }
      ];

      const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TEST - Weekly Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .test-banner { background: #f59e0b; color: white; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
    .job-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .job-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .job-company { color: #2563eb; font-weight: 500; }
    .job-salary { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 14px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="test-banner">🧪 TEST EMAIL - This is a test of the newsletter system</div>
  <div class="container">
    <div class="header">
      <h1>Weekly Six-Figure Jobs</h1>
      <p>Test Newsletter - ${new Date().toLocaleDateString()}</p>
    </div>
    <div style="padding: 20px;">
      <p>Hello Test User,</p>
      <p>This is a test of our newsletter system. Here are some sample jobs:</p>
      
      ${sampleJobs.map(job => `
        <div class="job-card">
          <div class="job-title">${job.JobTitle}</div>
          <div class="job-company">${job.Company}</div>
          <div style="color: #64748b; font-size: 14px;">${job.Location}${job.is_remote ? ' (Remote)' : ''}</div>
          <div class="job-salary">${job.formatted_salary}</div>
          <p style="color: #475569; font-size: 14px;">${job.ShortDescription}</p>
        </div>
      `).join('')}
      
      <p>This was a test email. If you received this, the newsletter system is working correctly!</p>
    </div>
  </div>
</body>
</html>
      `;

      await resend.emails.send({
        from: 'JobBoard Test <test@yourdomain.com>',
        to: testEmail,
        subject: '🧪 TEST - Weekly Newsletter System',
        html: testHTML,
      });

      return NextResponse.json({ 
        success: true,
        message: 'Test newsletter sent successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });

  } catch (error) {
    console.error('Newsletter test error:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}