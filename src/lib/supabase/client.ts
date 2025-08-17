// src/lib/supabase/client.ts - FIXED VERSION
import { createBrowserClient } from '@supabase/ssr'

// Remove the problematic type import and use any for now
let supabaseClient: any | null = null

export function createClient() {
  // Return existing client if it exists (singleton pattern)
  if (supabaseClient) {
    return supabaseClient
  }
  
  // Create new client only if it doesn't exist
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return supabaseClient
}

// Export the client directly for consistent usage
export const supabase = createClient()