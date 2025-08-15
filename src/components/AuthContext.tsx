// src/components/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAuth = async () => {
      try {
        console.log('🔐 AuthContext: Checking auth... Retry:', retryCount);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthContext: Session error:', error);
        }

        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          setLoading(false);
          
          console.log('🔐 AuthContext: User set to:', currentUser?.email || 'None');
          
          // If no user found and we haven't hit max retries, try again
          if (!currentUser && retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkAuth, 1000); // Retry after 1 second
          }
        }
      } catch (error) {
        console.error('🔐 AuthContext: Auth check error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 AuthContext: Auth state changed:', event, session?.user?.email || 'None');
      
      if (mounted) {
        const newUser = session?.user ?? null;
        setUser(newUser);
        setLoading(false);
        retryCount = 0; // Reset retry count on auth change
      }
    });

    // Listen for browser navigation events
    const handleFocus = () => {
      console.log('🔐 AuthContext: Window focus - rechecking auth');
      retryCount = 0;
      checkAuth();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔐 AuthContext: Page visible - rechecking auth');
        retryCount = 0;
        checkAuth();
      }
    };

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('supabase')) {
        console.log('🔐 AuthContext: Storage change detected - rechecking auth');
        retryCount = 0;
        checkAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔐 AuthContext: Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
      console.log('🔐 AuthContext: Sign out complete');
    } catch (error) {
      console.error('🔐 AuthContext: Sign out error:', error);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}