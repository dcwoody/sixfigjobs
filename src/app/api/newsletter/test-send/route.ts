// src/app/api/newsletter/test-send/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy factory — only reads env when called (not at build time)
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    // Check for API key at runtime
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured. Please check server configuration.' },
        { status: 500 }
      );
    }

    // Auth guard (optional - you can use Bearer token like in send/route.ts)
    const expectedSecret = process.env.NEWSLETTER_API_SECRET;
    if (expectedSecret) {
      const authHeader = request.headers.get('authorization') ?? '';
      const [scheme, token] = authHeader.split(' ');
      if (scheme !== 'Bearer' || !token || token !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Parse request body
    const body = await request.json().catch(() => ({} as any));
    const { email, subject, htmlContent } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Initialize Resend at runtime
    const resend = getResendClient();

    // Default test content if not provided
    const testSubject = subject || '🧪 Test Newsletter from SixFigHires';
    const testHtml = htmlContent || `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Newsletter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 30px 20px; }
    .test-badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 4px; font-weight: 600; margin-bottom: 20px; }
    .info-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SixFigHires Newsletter</h1>
    </div>
    
    <div class="content">
      <span class="test-badge">TEST EMAIL</span>
      
      <h2>Newsletter Test Successful! ✅</h2>
      
      <p>This is a test email to verify your newsletter configuration is working correctly.</p>
      
      <div class="info-box">
        <strong>Email Configuration Details:</strong>
        <ul>
          <li>Sent to: ${email}</li>
          <li>From: ${process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@sixfigjob.com>'}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
          <li>Environment: ${process.env.NODE_ENV || 'production'}</li>
        </ul>
      </div>
      
      <p>If you're seeing this email, your newsletter system is configured correctly and ready to send campaigns!</p>
      
      <h3>Next Steps:</h3>
      <ul>
        <li>Check that the email displays correctly</li>
        <li>Verify all links are working</li>
        <li>Test with different email providers</li>
        <li>Schedule your first newsletter campaign</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This is a test email from SixFigHires Newsletter System</p>
      <p>Sent on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send test email
    const result = await resend.emails.send({
      from: process.env.NEWSLETTER_FROM_EMAIL || 'JobBoard <newsletter@sixfigjob.com>',
      to: email,
      subject: testSubject,
      html: testHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      sentTo: email,
      messageId: result.data?.id || 'unknown',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}