// src/app/api/newsletter/welcome/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for API key at runtime, not build time
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured in environment variables');
      return NextResponse.json({ 
        error: 'Email service not configured. Please check server configuration.' 
      }, { status: 500 });
    }

    // Initialize Resend only when we have the API key
    const resend = new Resend(apiKey);

    const welcomeHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SixFigHires!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 30px 20px; }
    .feature-list { margin: 30px 0; }
    .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
    .feature-icon { width: 20px; height: 20px; background: #2563eb; border-radius: 50%; margin-right: 15px; margin-top: 2px; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SixFigHires! 🎉</h1>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <p>Hi ${firstName || 'there'},</p>
        <p>Thank you for subscribing to our weekly six-figure jobs newsletter!</p>
        
        <div class="feature-list">
          <div class="feature">
            <div class="feature-icon"></div>
            <div>
              <strong>Weekly Updates:</strong> Every week, we'll send you the latest high-paying job opportunities from top companies.
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon"></div>
            <div>
              <strong>Curated Jobs:</strong> Only positions with $100K+ compensation packages.
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon"></div>
            <div>
              <strong>Direct Links:</strong> Apply directly through company career pages.
            </div>
          </div>
        </div>
        
        <p>Your first newsletter will arrive this Friday with the latest opportunities!</p>
        
        <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://sixfigjob.com'}" class="cta-button">
          Browse Current Jobs
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you subscribed at SixFigHires.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://sixfigjob.com'}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a> | 
        <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://sixfigjob.com'}/preferences">Update Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@sixfigjob.com>',
      to: email,
      subject: 'Welcome to SixFigHires - Your Weekly Six-Figure Jobs Newsletter!',
      html: welcomeHTML,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Welcome email sent successfully' 
    });

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send welcome email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}