// src/app/api/newsletter/export/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Subscriber {
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  user_type: string;
}

export async function GET(request: NextRequest) {
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

    const supabase = createClient();
    
    const { data: subscribers, error } = await supabase
      .from('users_db')
      .select('email, first_name, last_name, created_at, user_type')
      .eq('is_newsletter_subscriber', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Export error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    // Generate CSV content
    const csvHeaders = ['Email', 'First Name', 'Last Name', 'User Type', 'Subscribed Date'];
    const csvRows = subscribers?.map((sub: Subscriber) => [
      sub.email,
      sub.first_name || '',
      sub.last_name || '',
      sub.user_type,
      new Date(sub.created_at).toLocaleDateString()
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: (string | null)[]) => row.map((field: string | null) => `"${field || ''}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=newsletter-subscribers.csv'
      }
    });

  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}