// src/app/auth/signout/route.ts - REVIEWED VERSION
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Create Supabase client (await if needed)
    const supabase = await createClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Signout error:', error)
      return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
    }
    
    console.log('✅ User signed out successfully')
    
    // Return success response
    return NextResponse.json({ message: 'Signed out successfully' })
    
  } catch (error) {
    console.error('❌ Signout route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString() 
    }, { status: 500 })
  }
}

// Also support GET method for direct URL signout
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Signout error:', error)
    }
    
    // Redirect to home page after signout
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL('/', requestUrl.origin))
    
  } catch (error) {
    console.error('❌ Signout GET route error:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL('/?error=signout_failed', requestUrl.origin))
  }
}