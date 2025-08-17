// src/app/signout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      // Clear any local storage if needed
      localStorage.clear()
      
      // Redirect to home page after short delay
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } else {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign Out
          </h2>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to sign out of your account?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 mr-2" />
                  Yes, Sign Out
                </>
              )}
            </button>
            
            <button
              onClick={() => router.back()}
              disabled={isSigningOut}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        
        {isSigningOut && (
          <p className="text-sm text-gray-500">
            Signing you out safely...
          </p>
        )}
      </div>
    </div>
  )
}