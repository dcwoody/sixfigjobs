// src/app/api/newsletter/send/route.ts
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

    const supabase = createClient();

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
      return NextResponse.json({ message: 'No subscribers found' }, { status: 200 });
    }

    // Get request body for email content
    const { subject, htmlContent, jobsData } = await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: 'Subject and htmlContent are required' }, { status: 400 });
    }

    // Send newsletter to all subscribers
    const emailPromises = subscribers.map(async (subscriber: Subscriber): Promise<SendResult> => {
      try {
        const personalizedContent = htmlContent.replace(
          '{{firstName}}',
          subscriber.first_name || 'there'
        ).replace(
          '{{email}}',
          subscriber.email
        );

        await resend.emails.send({
          from: process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@yourdomain.com>',
          to: subscriber.email,
          subject: subject,
          html: personalizedContent,
          headers: {
            'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}>`,
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

    const results = await Promise.all(emailPromises);
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      message: `Newsletter sent successfully`,
      stats: {
        total: subscribers.length,
        sent: sentCount,
        failed: failedCount
      },
      results
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}