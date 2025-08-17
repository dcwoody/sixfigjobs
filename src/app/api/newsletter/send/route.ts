// src/app/api/newsletter/send/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Conditional instantiation to avoid build errors
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
};

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
    // Check API key first
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 });
    }

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

    // Create Supabase client using standard server pattern
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

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
    const { subject, htmlContent } = await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: 'Subject and htmlContent are required' }, { status: 400 });
    }

    // Only instantiate Resend when actually sending
    const resend = getResendClient();

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
    const sent = results.filter((r: SendResult) => r.status === 'sent').length;
    const failed = results.filter((r: SendResult) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      sent,
      failed,
      results
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ 
      error: 'Failed to send newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}