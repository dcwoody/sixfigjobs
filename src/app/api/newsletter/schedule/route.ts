// src/app/api/newsletter/schedule/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ScheduleRequest {
  action: string;
  scheduleDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes(process.env.NEWSLETTER_API_SECRET || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, scheduleDate }: ScheduleRequest = await request.json();

    if (action === 'auto-send') {
      // Check if it's Monday and we haven't sent this week
      const today = new Date();
      const isMonday = today.getDay() === 1; // 1 = Monday
      
      if (!isMonday) {
        return NextResponse.json({ 
          message: 'Auto-send only triggers on Mondays',
          skipped: true 
        });
      }

      // Check if we already sent this week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1); // Set to Monday
      weekStart.setHours(0, 0, 0, 0);

      const supabase = createClient();
      
      // TODO: Create newsletter_sends table to track sends
      // For now, we'll just proceed with sending
      
      // Generate and send newsletter
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      
      const generateResponse = await fetch(`${baseUrl}/api/newsletter/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`Failed to generate newsletter content: ${errorText}`);
      }

      const content = await generateResponse.json();

      // Send newsletter
      const sendResponse = await fetch(`${baseUrl}/api/newsletter/send`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        throw new Error(`Failed to send newsletter: ${errorText}`);
      }

      const sendResult = await sendResponse.json();

      return NextResponse.json({
        message: 'Newsletter auto-sent successfully',
        ...sendResult
      });
    }

    if (action === 'schedule') {
      // Future implementation for scheduling newsletters
      return NextResponse.json({ 
        message: 'Newsletter scheduling not yet implemented',
        scheduledFor: scheduleDate 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Newsletter schedule error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method for checking schedule status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes(process.env.NEWSLETTER_API_SECRET || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const isMonday = today.getDay() === 1;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);

    return NextResponse.json({
      currentTime: today.toISOString(),
      isMonday,
      nextScheduledSend: nextMonday.toISOString(),
      autoSendEnabled: process.env.NEWSLETTER_AUTO_SEND === 'true'
    });

  } catch (error) {
    console.error('Schedule status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}