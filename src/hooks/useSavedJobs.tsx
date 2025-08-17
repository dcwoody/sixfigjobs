// src/hooks/useSavedJobs.tsx - UPDATED with Provider
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase/client';

// Define types locally to avoid import issues
interface Session {
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';

interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  saved_at: string;
}

interface JobListing {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  slug: string;
  ShortDescription: string;
  PostedDate: string;
  is_remote: boolean;
  JobType: string;
}

interface SavedJobWithDetails {
  id: string;
  job_id: string;
  saved_at: string;
  job_listings_db?: JobListing;
}

interface SavedJobsContextType {
  savedJobs: SavedJobWithDetails[];
  loading: boolean;
  error: string | null;
  saveJob: (jobId: string) => Promise<boolean>;
  removeSavedJob: (savedJobId: string) => Promise<boolean>;
  isJobSaved: (jobId: string) => boolean;
  refreshSavedJobs: () => Promise<void>;
}

// Create context
const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

// Provider component
export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        await fetchSavedJobs(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes with proper types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
          fetchSavedJobs(session.user.id);
        } else {
          setCurrentUserId(null);
          setSavedJobs([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchSavedJobs = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          job_id,
          saved_at,
          job_listings_db!inner (
            JobID,
            JobTitle,
            Company,
            Location,
            formatted_salary,
            slug,
            ShortDescription,
            PostedDate,
            is_remote,
            JobType
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to handle the nested structure with proper typing
      const transformedJobs = data?.map((item: any) => ({
        id: item.id,
        job_id: item.job_id,
        saved_at: item.saved_at,
        job_listings_db: Array.isArray(item.job_listings_db) 
          ? item.job_listings_db[0] 
          : item.job_listings_db
      })) || [];

      setSavedJobs(transformedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved jobs');
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId: string): Promise<boolean> => {
    if (!currentUserId) {
      setError('User must be logged in to save jobs');
      return false;
    }

    try {
      setError(null);

      // Check if job is already saved
      const { data: existingJob } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('job_id', jobId)
        .single();

      if (existingJob) {
        setError('Job is already saved');
        return false;
      }

      // Save the job
      const { error: saveError } = await supabase
        .from('saved_jobs')
        .insert([
          {
            user_id: currentUserId,
            job_id: jobId,
            saved_at: new Date().toISOString()
          }
        ]);

      if (saveError) {
        throw saveError;
      }

      // Refresh saved jobs list
      await fetchSavedJobs(currentUserId);
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
      console.error('Error saving job:', err);
      return false;
    }
  };

  const removeSavedJob = async (savedJobId: string): Promise<boolean> => {
    if (!currentUserId) {
      setError('User must be logged in');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId)
        .eq('user_id', currentUserId); // Extra security check

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove saved job');
      console.error('Error removing saved job:', err);
      return false;
    }
  };

  const isJobSaved = (jobId: string): boolean => {
    return savedJobs.some(savedJob => savedJob.job_id === jobId);
  };

  const refreshSavedJobs = async (): Promise<void> => {
    if (currentUserId) {
      await fetchSavedJobs(currentUserId);
    }
  };

  const value = {
    savedJobs,
    loading,
    error,
    saveJob,
    removeSavedJob,
    isJobSaved,
    refreshSavedJobs
  };

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
}

// Hook to use the context
export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (context === undefined) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
}