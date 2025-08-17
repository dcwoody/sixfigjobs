// src/app/api/newsletter/send/route.ts - REVIEWED VERSION
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Subscriber {
  email: string;
  first_name: string | null;
}

interface SendResult {
  email: string;
  status: 'sent' | 'failed';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key or admin authentication
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

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Create Supabase client (await if needed)
    const supabase = await createClient();

    // Get all newsletter subscribers
    const { data: subscribers, error } = await supabase
      .from('users_db')
      .select('email, first_name')
      .eq('is_newsletter_subscriber', true)
      .eq('is_verified', true);

    if (error) {
      console.error('Error fetching subscribers:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('📭 No subscribers found');
      return NextResponse.json({ 
        message: 'No subscribers found',
        stats: { total: 0, sent: 0, failed: 0 }
      }, { status: 200 });
    }

    // Get request body for email content
    const { subject, htmlContent, jobsData } = await request.json();
    
    if (!subject || !htmlContent) {
      return NextResponse.json({ error: 'Subject and htmlContent are required' }, { status: 400 });
    }

    console.log(`📧 Starting newsletter send to ${subscribers.length} subscribers`);

    // Send newsletter to all subscribers with rate limiting
    const batchSize = 10; // Send in batches to avoid rate limits
    const results: SendResult[] = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (subscriber: Subscriber): Promise<SendResult> => {
        try {
          // Personalize content
          const personalizedContent = htmlContent
            .replace(/\{\{firstName\}\}/g, subscriber.first_name || 'there')
            .replace(/\{\{email\}\}/g, subscriber.email);

          const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@yourdomain.com>';
          const unsubscribeUrl = `${process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

          await resend.emails.send({
            from: fromEmail,
            to: subscriber.email,
            subject: subject,
            html: personalizedContent,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });

          return { email: subscriber.email, status: 'sent' };
          
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          return {
            email: subscriber.email,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add small delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`📧 Newsletter send completed: ${sentCount} sent, ${failedCount} failed`);

    // Log failed sends for debugging
    const failedEmails = results.filter(r => r.status === 'failed');
    if (failedEmails.length > 0) {
      console.error('Failed sends:', failedEmails);
    }

    return NextResponse.json({
      message: `Newsletter sent successfully`,
      stats: {
        total: subscribers.length,
        sent: sentCount,
        failed: failedCount
      },
      results: process.env.NODE_ENV === 'development' ? results : undefined // Only include detailed results in dev
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}