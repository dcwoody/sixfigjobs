// src/hooks/useSavedJobs.tsx
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthContext'; // Use global auth
import { useRouter } from 'next/navigation';

interface SavedJobsContextType {
  savedJobIds: Set<string>;
  isJobSaved: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<boolean>;
  unsaveJob: (jobId: string) => Promise<boolean>;
  loading: boolean;
}

const SavedJobsContext = createContext<SavedJobsContextType>({
  savedJobIds: new Set(),
  isJobSaved: () => false,
  saveJob: async () => false,
  unsaveJob: async () => false,
  loading: true,
});

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Use global auth instead of separate auth check
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchSavedJobs = async (userId: string) => {
      try {
        console.log('💾 SavedJobs: Fetching saved jobs for user:', userId);
        
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', userId);

        if (error) {
          console.error('💾 SavedJobs: Error fetching saved jobs:', error);
          return;
        }
        
        if (isMounted && data) {
          const jobIds = new Set<string>(data.map((item) => item.job_id as string));
          setSavedJobIds(jobIds);
          console.log('💾 SavedJobs: Loaded', jobIds.size, 'saved jobs');
        }
      } catch (err) {
        console.error('💾 SavedJobs: Error fetching saved jobs:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      console.log('💾 SavedJobs: User found, fetching saved jobs for:', user.email);
      fetchSavedJobs(user.id);
    } else {
      console.log('💾 SavedJobs: No user, clearing saved jobs');
      setSavedJobIds(new Set());
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]); // Only depend on user from global auth context

  const isJobSaved = (jobId: string): boolean => savedJobIds.has(jobId);

  const saveJob = async (jobId: string): Promise<boolean> => {
    if (!user) {
      console.log('💾 SavedJobs: No user, redirecting to login');
      router.push('/login');
      return false;
    }

    try {
      console.log('💾 SavedJobs: Saving job:', jobId, 'for user:', user.email);
      
      const { error } = await supabase.from('saved_jobs').insert([
        {
          user_id: user.id,
          job_id: jobId,
          saved_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('💾 SavedJobs: Error saving job:', error);
        return false;
      }

      setSavedJobIds((prev) => new Set([...prev, jobId]));
      console.log('💾 SavedJobs: Job saved successfully');
      return true;
    } catch (err) {
      console.error('💾 SavedJobs: Error saving job:', err);
      return false;
    }
  };

  const unsaveJob = async (jobId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('💾 SavedJobs: Unsaving job:', jobId, 'for user:', user.email);
      
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) {
        console.error('💾 SavedJobs: Error unsaving job:', error);
        return false;
      }

      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      console.log('💾 SavedJobs: Job unsaved successfully');
      return true;
    } catch (err) {
      console.error('💾 SavedJobs: Error unsaving job:', err);
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