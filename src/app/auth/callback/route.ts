// src/app/auth/callback/route.ts - REVIEWED VERSION
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/welcome'

  if (code) {
    // Create Supabase client (await if needed)
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication
      console.log('✅ Auth callback successful, redirecting to:', next);
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      console.error('❌ Auth callback error:', error);
    }
  } else {
    console.error('❌ No code provided in auth callback');
  }

  // Authentication failed
  console.log('🔄 Auth failed, redirecting to login');
  return NextResponse.redirect(
    new URL(`/login?error=auth_failed`, requestUrl.origin)
  )
}