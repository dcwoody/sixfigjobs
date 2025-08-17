// src/app/api/newsletter/cron/route.ts
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

    // Step 1: Generate newsletter content
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/newsletter/generate-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEWSLETTER_API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    if (!generateResponse.ok) {
      throw new Error(`Failed to generate content: ${generateResponse.status}`);
    }

    const content = await generateResponse.json();
    console.log('📝 Newsletter content generated:', {
      subject: content.subject,
      jobCount: content.jobsData.length,
      stats: content.stats
    });

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
      throw new Error(`Failed to send newsletter: ${sendResponse.status}`);
    }

    const sendResult = await sendResponse.json();
    console.log('📧 Newsletter sent successfully:', sendResult.stats);

    // Step 3: Log the successful send
    const summary = {
      timestamp: new Date().toISOString(),
      subject: content.subject,
      jobsIncluded: content.jobsData.length,
      subscribersSent: sendResult.stats.sent,
      subscribersFailed: sendResult.stats.failed,
      totalSubscribers: sendResult.stats.total
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