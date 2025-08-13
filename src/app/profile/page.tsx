// src/app/profile/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
        <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
        
        <form action="/api/auth/signout" method="post" className="mt-4">
          <button 
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}