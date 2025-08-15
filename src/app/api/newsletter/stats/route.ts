export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get total subscribers
    const { count: totalSubscribers } = await supabase
      .from('users_db')
      .select('*', { count: 'exact', head: true })
      .eq('is_newsletter_subscriber', true)
      .eq('is_verified', true);

    // Get new subscribers this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newThisWeek } = await supabase
      .from('users_db')
      .select('*', { count: 'exact', head: true })
      .eq('is_newsletter_subscriber', true)
      .gte('created_at', oneWeekAgo.toISOString());

    const stats = {
      totalSubscribers: totalSubscribers || 0,
      newThisWeek: newThisWeek || 0,
      lastSentDate: '2024-08-10T10:00:00Z',
      openRate: 65.5
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}