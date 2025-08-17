// src/app/api/newsletter/stats/route.ts - REVIEWED VERSION
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client (await if needed)
    const supabase = await createClient();
    
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
      .eq('is_verified', true)
      .gte('created_at', oneWeekAgo.toISOString());

    // Get total users for growth rate calculation
    const { count: totalUsers } = await supabase
      .from('users_db')
      .select('*', { count: 'exact', head: true });

    // Calculate subscription rate
    const subscriptionRate = totalUsers && totalUsers > 0 
      ? ((totalSubscribers || 0) / totalUsers * 100) 
      : 0;

    // Try to get the last newsletter send date from actual data
    // You could create a newsletter_sends table to track this
    const lastSentDate = '2024-08-10T10:00:00Z'; // Placeholder - replace with actual tracking

    const stats = {
      totalSubscribers: totalSubscribers || 0,
      newThisWeek: newThisWeek || 0,
      totalUsers: totalUsers || 0,
      subscriptionRate: Math.round(subscriptionRate * 10) / 10, // Round to 1 decimal
      lastSentDate,
      openRate: 65.5, // Placeholder - integrate with email service analytics
      clickRate: 12.3, // Placeholder - integrate with email service analytics
      unsubscribeRate: 2.1 // Placeholder - integrate with email service analytics
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}