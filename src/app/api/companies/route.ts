// src/app/api/companies/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient() // Await the server client

    const { data: companies, error } = await supabase
      .from('company_db')  // Fixed: should be 'company_db' not 'companies_db'
      .select('*')
      .order('name', { ascending: true }); // Remove limit, get all companies

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    // Return companies directly (not wrapped in { data })
    return NextResponse.json(companies || []);

  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}