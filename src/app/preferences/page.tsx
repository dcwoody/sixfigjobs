// src/components/AuthProvider.tsx
'use client';

import { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  session: Session | null;
  userInfo: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);

  useEffect(() => {
    const getSessionAndUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      if (currentSession?.user?.id) {
        const { data, error } = await supabase
          .from('users_db')
          .select('*')
          .eq('auth_user_id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching user from users_db:', error.message);
        } else {
          setUserInfo(data);
        }
      }
    };

    getSessionAndUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession?.user?.id) {
        const { data, error } = await supabase
          .from('users_db')
          .select('*')
          .eq('auth_user_id', newSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching user from users_db on auth change:', error.message);
        } else {
          setUserInfo(data);
        }
      } else {
        setUserInfo(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
