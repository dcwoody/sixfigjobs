// src/app/api/newsletter/welcome/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const welcomeHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Newsletter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
    .content { padding: 40px 20px; }
    .welcome-message { font-size: 18px; color: #374151; margin-bottom: 30px; }
    .feature-list { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 30px 0; }
    .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
    .feature-icon { width: 24px; height: 24px; background: #2563eb; border-radius: 50%; margin-right: 15px; flex-shrink: 0; margin-top: 2px; }
    .feature h3 { margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1f2937; }
    .feature p { margin: 0; font-size: 14px; color: #6b7280; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; }
    .footer { background: #f1f5f9; padding: 30px 20px; text-align: center; color: #6b7280; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to the Team! 🎉</h1>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <p>Hi ${firstName || 'there'},</p>
        <p>Thank you for subscribing to our weekly six-figure jobs newsletter! You've just joined thousands of ambitious professionals who are serious about advancing their careers.</p>
      </div>

      <div class="feature-list">
        <div class="feature">
          <div class="feature-icon"></div>
          <div>
            <h3>Curated Opportunities</h3>
            <p>Hand-picked jobs paying $100K+ from top companies across various industries</p>
          </div>
        </div>
        
        <div class="feature">
          <div class="feature-icon"></div>
          <div>
            <h3>Weekly Delivery</h3>
            <p>Fresh opportunities delivered every Monday morning to start your week right</p>
          </div>
        </div>
        
        <div class="feature">
          <div class="feature-icon"></div>
          <div>
            <h3>Career Insights</h3>
            <p>Salary trends, interview tips, and career advancement strategies</p>
          </div>
        </div>
        
        <div class="feature">
          <div class="feature-icon"></div>
          <div>
            <h3>No Spam Promise</h3>
            <p>Quality over quantity. Unsubscribe anytime with one click</p>
          </div>
        </div>
      </div>

      <p>Your first newsletter will arrive next Monday. In the meantime, feel free to browse our current job listings:</p>
      
      <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com'}/jobs" class="cta-button">Browse Current Jobs</a>
      
      <p>Welcome aboard!</p>
      <p>The JobBoard Team</p>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you subscribed to our newsletter at ${process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com'}</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com'}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a> | 
        <a href="${process.env.NEXT_PUBLIC_DOMAIN || 'https://yourdomain.com'}">Visit Website</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: process.env.WELCOME_FROM_EMAIL || 'JobBoard <welcome@yourdomain.com>',
      to: email,
      subject: '🎉 Welcome to Six-Figure Jobs Newsletter!',
      html: welcomeHTML,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}