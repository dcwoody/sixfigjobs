// src/app/sitemap.xml/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data: jobs, error } = await supabase
  .from('jobs_db')
  .select('slug, UpdatedTime')
  .order('UpdatedTime', { ascending: false });
