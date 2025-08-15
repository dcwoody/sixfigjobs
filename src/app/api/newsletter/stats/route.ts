// src/app/api/newsletter/stats/route.ts  
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

    // TODO: Implement newsletter_sends table to track sends and opens
    // For now, return mock data for lastSentDate and openRate
    const stats = {
      totalSubscribers: totalSubscribers || 0,
      newThisWeek: newThisWeek || 0,
      lastSentDate: '2024-08-10T10:00:00Z', // Mock data - replace with real data when you implement tracking
      openRate: 65.5 // Mock data - replace with real data when you implement tracking
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}