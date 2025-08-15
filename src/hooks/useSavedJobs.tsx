// src/hooks/useSavedJobs.tsx - ORIGINAL WORKING VERSION
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface SavedJobsContextType {
  savedJobIds: Set<string>;
  isJobSaved: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<boolean>;
  unsaveJob: (jobId: string) => Promise<boolean>;
  loading: boolean;
  user: User | null;
}

const SavedJobsContext = createContext<SavedJobsContextType>({
  savedJobIds: new Set(),
  isJobSaved: () => false,
  saveJob: async () => false,
  unsaveJob: async () => false,
  loading: true,
  user: null,
});

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchSavedJobs(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchSavedJobs(session.user.id);
      } else {
        setUser(null);
        setSavedJobIds(new Set());
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSavedJobs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching saved jobs:', error);
        return;
      }
      if (data) {
        const jobIds = new Set<string>(data.map((item) => item.job_id as string));
        setSavedJobIds(jobIds);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const isJobSaved = (jobId: string): boolean => savedJobIds.has(jobId);

  const saveJob = async (jobId: string): Promise<boolean> => {
    if (!user) {
      router.push('/login');
      return false;
    }

    try {
      const { error } = await supabase.from('saved_jobs').insert([
        {
          user_id: user.id,
          job_id: jobId,
          saved_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error saving job:', error);
        return false;
      }

      setSavedJobIds((prev) => new Set([...prev, jobId]));
      return true;
    } catch (err) {
      console.error('Error saving job:', err);
      return false;
    }
  };

  const unsaveJob = async (jobId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) {
        console.error('Error unsaving job:', error);
        return false;
      }

      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      return true;
    } catch (err) {
      console.error('Error unsaving job:', err);
      return false;
    }
  };

  return (
    <SavedJobsContext.Provider
      value={{
        savedJobIds,
        isJobSaved,
        saveJob,
        unsaveJob,
        loading,
        user,
      }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
}