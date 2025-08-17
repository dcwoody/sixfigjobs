// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/welcome'

  if (code) {
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication
      // Redirect to the 'next' URL or welcome page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Authentication failed
  return NextResponse.redirect(
    new URL(`/login?error=auth_failed`, requestUrl.origin)
  )
}