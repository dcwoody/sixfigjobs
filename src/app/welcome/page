// src/app/welcome/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WelcomeDashboard from './WelcomeDashboard'

export default async function WelcomePage() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch initial data server-side
  const { data: userProfile } = await supabase
    .from('users_db')
    .select('*')
    .eq('auth_user_id', session.user.id)
    .single()

  return (
    <WelcomeDashboard 
      initialSession={session} 
      initialProfile={userProfile}
    />
  )
}