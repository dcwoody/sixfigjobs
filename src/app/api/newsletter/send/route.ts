// src/app/api/newsletter/send/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Lazy factory — only reads env when called (not at build time)
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
    // --- Ensure email provider key exists ---
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    // --- Auth guard (Bearer <token>) ---
    const expectedSecret = process.env.NEWSLETTER_API_SECRET;
    const authHeader = request.headers.get('authorization') ?? '';
    const [scheme, token] = authHeader.split(' ');
    if (!expectedSecret || scheme !== 'Bearer' || !token || token !== expectedSecret) {
      console.log('Auth failed:', { received: token, expected: expectedSecret });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Supabase server client ---
    // NOTE: In your environment, cookies() returns a Promise, so await it:
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

    // --- Fetch verified newsletter subscribers ---
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

    // --- Parse request body safely ---
    const body = await request.json().catch(() => ({} as any));
    const subject: string | undefined = body?.subject;
    const htmlContent: string | undefined = body?.htmlContent;

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Subject and htmlContent are required' },
        { status: 400 }
      );
    }

    // --- Prepare stable site URL for headers/links ---
    const siteUrl =
      process.env.SITE_URL?.replace(/\/+$/, '') ||
      process.env.NEXT_PUBLIC_DOMAIN?.replace(/\/+$/, '') ||
      'https://sixfigjob.com';

    // --- Resend client (runtime) ---
    const resend = getResendClient();

    // --- Send newsletter (parallel) ---
    const results = await Promise.all(
      subscribers.map(async (subscriber: Subscriber): Promise<SendResult> => {
        try {
          const personalizedContent = htmlContent
            .replace('{{firstName}}', subscriber.first_name || 'there')
            .replace('{{email}}', subscriber.email);

          await resend.emails.send({
            from: process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@sixfigjob.com>',
            to: subscriber.email,
            subject,
            html: personalizedContent,
            headers: {
              'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(
                subscriber.email
              )}>`,
            },
          });

          return { email: subscriber.email, status: 'sent' };
        } catch (err) {
          console.error(`Failed to send to ${subscriber.email}:`, err);
          return {
            email: subscriber.email,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      })
    );

    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.length - sent;

    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send newsletter',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
