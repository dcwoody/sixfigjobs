// src/app/api/newsletter/test-send/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
const expectedSecret = process.env.NEWSLETTER_API_SECRET;

if (!authHeader || !expectedSecret) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Extract token from "Bearer TOKEN" format
const token = authHeader.replace('Bearer ', '');

if (token !== expectedSecret) {
  console.log('Auth failed:', { received: token, expected: expectedSecret });
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

    const { testEmail, subject, htmlContent } = await request.json();

    if (!testEmail || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send test newsletter to single email only
    const personalizedContent = htmlContent.replace('{{firstName}}', 'Test User').replace('{{email}}', testEmail);

    await resend.emails.send({
      from: process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@sixfigjob.com>',
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html: personalizedContent,
    });

    return NextResponse.json({ 
      success: true,
      message: `Test newsletter sent to ${testEmail}`
    });

  } catch (error) {
    console.error('Test newsletter error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}