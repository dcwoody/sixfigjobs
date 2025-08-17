// src/app/api/newsletter/cron/route.ts - REVIEWED VERSION
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify this request is from Vercel cron using the official method
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('Unauthorized cron access attempt:', { authHeader });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Newsletter cron job started at:', new Date().toISOString());
    console.log('Triggered by: Vercel Cron');

    // Ensure we have the required environment variables
    if (!process.env.NEXT_PUBLIC_DOMAIN || !process.env.NEWSLETTER_API_SECRET) {
      throw new Error('Missing required environment variables');
    }

    // Step 1: Generate newsletter content
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/newsletter/generate-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEWSLETTER_API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Failed to generate content: ${generateResponse.status} - ${errorText}`);
    }

    const content = await generateResponse.json();
    console.log('📝 Newsletter content generated:', {
      subject: content.subject,
      jobCount: content.jobsData?.length || 0,
      stats: content.stats
    });

    // Skip sending if no jobs found
    if (!content.jobsData || content.jobsData.length === 0) {
      console.log('⚠️ No jobs found, skipping newsletter send');
      return NextResponse.json({
        success: true,
        message: 'Newsletter skipped - no jobs to send',
        summary: {
          timestamp: new Date().toISOString(),
          jobsIncluded: 0,
          subscribersSent: 0,
          reason: 'No jobs available'
        }
      });
    }

    // Step 2: Send newsletter to all subscribers
    const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/newsletter/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEWSLETTER_API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: content.subject,
        htmlContent: content.htmlContent,
        jobsData: content.jobsData
      })
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Failed to send newsletter: ${sendResponse.status} - ${errorText}`);
    }

    const sendResult = await sendResponse.json();
    console.log('📧 Newsletter sent successfully:', sendResult.stats);

    // Step 3: Log the successful send
    const summary = {
      timestamp: new Date().toISOString(),
      subject: content.subject,
      jobsIncluded: content.jobsData.length,
      subscribersSent: sendResult.stats?.sent || 0,
      subscribersFailed: sendResult.stats?.failed || 0,
      totalSubscribers: sendResult.stats?.total || 0
    };

    return NextResponse.json({
      success: true,
      message: 'Weekly newsletter sent successfully',
      summary
    });

  } catch (error) {
    console.error('❌ Newsletter cron job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}