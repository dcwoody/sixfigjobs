// src/components/SaveJobButton.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Define types locally
interface Session {
  user: {
    id: string;
    email?: string;
  };
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';

interface SaveJobButtonProps {
  jobId: string;
  variant?: 'heart' | 'bookmark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function SaveJobButton({ 
  jobId, 
  variant = 'bookmark', 
  size = 'md', 
  showText = true,
  className = ''
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Session['user'] | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  useEffect(() => {
    // Get initial session and check if job is saved
    const initializeButton = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await checkIfJobSaved(session.user.id);
      }
    };

    initializeButton();

    // Listen for auth changes with proper types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await checkIfJobSaved(session.user.id);
        } else {
          setUser(null);
          setIsSaved(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [jobId]);

  const checkIfJobSaved = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .single();

      setIsSaved(!!data && !error);
    } catch (error) {
      // Job not found is expected for unsaved jobs
      setIsSaved(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        // Remove from saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);

        if (!error) {
          setIsSaved(false);
        }
      } else {
        // Add to saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .insert([
            {
              user_id: user.id,
              job_id: jobId,
              saved_at: new Date().toISOString()
            }
          ]);

        if (!error) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
    } finally {
      setLoading(false);
    }
  };

  const Icon = variant === 'heart' ? Heart : Bookmark;

  return (
    <button
      onClick={handleSaveToggle}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-lg transition-all
        ${sizeClasses[size]}
        ${isSaved 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={isSaved ? 'Remove from saved jobs' : 'Save job'}
      aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}

    >
      <Icon 
        className={`
          ${iconSizes[size]}
          ${isSaved ? 'fill-current' : ''}
        `}
      />
      {showText && (
        <span className="ml-1.5 text-sm font-medium">
          {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}