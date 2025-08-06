// src/hooks/useWeeklyJobs.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useWeeklyJobs = () => {
  const [weeklyJobCount, setWeeklyJobCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyJobs = async () => {
      try {
        setLoading(true);
        
        // Get the start of this week (Monday)
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Get the end of this week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('job_listings_db')
          .select('id', { count: 'exact' })
          .gte('created_at', startOfWeek.toISOString())
          .lte('created_at', endOfWeek.toISOString());

        if (error) {
          console.error('Error fetching weekly jobs:', error);
          setError('Failed to fetch job count');
        } else {
          setWeeklyJobCount(data?.length || 0);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch job count');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyJobs();
  }, []);

  return { weeklyJobCount, loading, error };
};

// Alternative version if you prefer using Supabase's count function
export const useWeeklyJobsCount = () => {
  const [weeklyJobCount, setWeeklyJobCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyJobsCount = async () => {
      try {
        setLoading(true);
        
        // Get the start of this week (Monday)
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Get the end of this week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const { count, error } = await supabase
          .from('job_listings_db')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString())
          .lte('created_at', endOfWeek.toISOString());

        if (error) {
          console.error('Error fetching weekly jobs count:', error);
          setError('Failed to fetch job count');
        } else {
          setWeeklyJobCount(count || 0);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch job count');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyJobsCount();
  }, []);

  return { weeklyJobCount, loading, error };
};