// src/app/api/newsletter/export/route.ts - REVIEWED VERSION
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
    // Authentication check
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

    // Create Supabase client (await if needed)
    const supabase = await createClient();
    
    // Fetch subscribers
    const { data: subscribers, error } = await supabase
      .from('users_db')
      .select('email, first_name, last_name, created_at, user_type')
      .eq('is_newsletter_subscriber', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Export error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    // Handle empty results
    if (!subscribers || subscribers.length === 0) {
      const emptyCSV = 'Email,First Name,Last Name,User Type,Subscribed Date\n';
      return new NextResponse(emptyCSV, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=newsletter-subscribers-empty.csv'
        }
      });
    }

    // Generate CSV content
    const csvHeaders = ['Email', 'First Name', 'Last Name', 'User Type', 'Subscribed Date'];
    const csvRows = subscribers.map((sub: Subscriber) => [
      sub.email,
      sub.first_name || '',
      sub.last_name || '',
      sub.user_type || '',
      new Date(sub.created_at).toLocaleDateString()
    ]);

    // Helper function to escape CSV fields
    const escapeCSVField = (field: string | null): string => {
      if (!field) return '""';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = field.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: (string | null)[]) => 
        row.map(field => escapeCSVField(field)).join(',')
      )
    ].join('\n');

    // Add timestamp to filename
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `newsletter-subscribers-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}