// src/app/welcome/page.tsx - REVIEWED VERSION
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WelcomeDashboard from './WelcomeDashboard'

export default async function WelcomePage() {
  // Create Supabase client (await if needed)
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch initial data server-side
  const { data: userProfile, error } = await supabase
    .from('users_db')
    .select('*')
    .eq('auth_user_id', session.user.id)
    .single()

  // Handle potential profile fetch error
  if (error) {
    console.error('Error fetching user profile:', error)
    // You might want to create the profile if it doesn't exist
    // or redirect to a profile setup page
  }

  return (
    <WelcomeDashboard 
      initialSession={session} 
      initialProfile={userProfile || null}
    />
  )
}