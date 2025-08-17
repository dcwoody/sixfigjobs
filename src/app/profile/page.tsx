// src/app/profile/page.tsx - Fixed TypeScript errors
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  BookmarkIcon, 
  BriefcaseIcon, 
  TrashIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  UserIcon,
  MailIcon,
  BellIcon
} from 'lucide-react';

// Define types locally to avoid import issues
interface Session {
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';

interface UserProfile {
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type: string;
  is_newsletter_subscriber: boolean;
  is_verified: boolean;
  created_at: string;
}

interface SavedJobWithDetails {
  id: string;
  job_id: string;
  saved_at: string;
  job_listings_db?: {
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
    job_url: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setSession(session);
      await fetchUserProfile(session.user.id);
      await fetchSavedJobs(session.user.id);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes with proper types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else {
          setSession(session);
          if (session.user.id) {
            fetchUserProfile(session.user.id);
            fetchSavedJobs(session.user.id);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_db')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
      } else {
        console.error('Error fetching user profile:', error);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async (userId: string) => {
    try {
      const { data, error } = await supabase
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
            JobType,
            job_url
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (!error && data) {
        // Transform the data to handle the nested structure
        const transformedJobs = data.map((item: any) => ({
          id: item.id,
          job_id: item.job_id,
          saved_at: item.saved_at,
          job_listings_db: Array.isArray(item.job_listings_db) 
            ? item.job_listings_db[0] 
            : item.job_listings_db
        }));
        setSavedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const handleNewsletterToggle = async () => {
    if (!userProfile?.auth_user_id) return;

    setNewsletterLoading(true);
    const newStatus = !userProfile.is_newsletter_subscriber;

    try {
      const { error } = await supabase
        .from('users_db')
        .update({ is_newsletter_subscriber: newStatus })
        .eq('auth_user_id', userProfile.auth_user_id);

      if (!error) {
        setMessage(
          newStatus 
            ? '✅ Successfully subscribed to weekly job alerts!' 
            : '📭 Unsubscribed from newsletter.'
        );
        setUserProfile(prev => prev ? { ...prev, is_newsletter_subscriber: newStatus } : null);
      } else {
        setMessage('Failed to update subscription. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId);

      if (!error) {
        setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
        setMessage('✅ Job removed from saved list');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to remove job');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
      setMessage('❌ An error occurred');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">Please try logging in again.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and saved jobs</p>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {userProfile.first_name && userProfile.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : userProfile.first_name || 'User'
                  }
                </h3>
                <p className="text-gray-600">{userProfile.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {userProfile.is_verified ? '✓ Verified' : 'Pending Verification'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <MailIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700">Newsletter</span>
                  </div>
                  <button
                    onClick={handleNewsletterToggle}
                    disabled={newsletterLoading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      userProfile.is_newsletter_subscriber
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {newsletterLoading ? 'Updating...' : (
                      userProfile.is_newsletter_subscriber ? 'Unsubscribe' : 'Subscribe'
                    )}
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Account Type:</strong> {userProfile.user_type.replace('_', ' ')}</p>
                  <p><strong>Member Since:</strong> {formatDate(userProfile.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookmarkIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Saved Jobs ({savedJobs.length})
                </h2>
                <Link 
                  href="/jobs" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse More Jobs
                </Link>
              </div>

              {savedJobsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading saved jobs...</p>
                </div>
              ) : savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((savedJob) => {
                    const job = savedJob.job_listings_db;
                    if (!job) return null;

                    return (
                      <div key={savedJob.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <Link 
                                href={`/jobs/${job.slug}`}
                                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {job.JobTitle}
                              </Link>
                              <button
                                onClick={() => removeSavedJob(savedJob.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                                title="Remove from saved jobs"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="flex items-center text-gray-600 mb-3">
                              <BriefcaseIcon className="w-4 h-4 mr-2" />
                              <span className="font-medium">{job.Company}</span>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                              <span className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {job.Location}
                                {job.is_remote && <span className="ml-1 text-green-600">(Remote)</span>}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                Saved {formatDate(savedJob.saved_at)}
                              </span>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2">{job.ShortDescription}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-green-600">
                                  {job.formatted_salary}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {job.JobType.replace('_', ' ')}
                                </span>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Link 
                                  href={`/jobs/${job.slug}`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                  View Details
                                </Link>
                                <a
                                  href={job.job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                                >
                                  Apply <ExternalLinkIcon className="w-4 h-4 ml-1" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 mb-6">Start browsing and save jobs you're interested in!</p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BriefcaseIcon className="w-5 h-5 mr-2" />
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}