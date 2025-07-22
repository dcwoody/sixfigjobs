'use client';

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';

import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/user'; // ✅ Import correct type

export interface AuthContextType {
  session: Session | null;
  userInfo: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession) {
        const { data: userDbData } = await supabase
          .from('users_db')
          .select('*')
          .eq('auth_user_id', currentSession.user.id)
          .single();

        setUserInfo(userDbData ?? null);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession) {
        supabase
          .from('users_db')
          .select('*')
          .eq('auth_user_id', newSession.user.id)
          .single()
          .then(({ data }) => {
            setUserInfo(data ?? null);
          });
      } else {
        setUserInfo(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, userInfo, loading }}>
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
