// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  BookmarkIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  ClockIcon, 
  EyeIcon, 
  XIcon,
  DollarSign,
  Building2,
  ExternalLink,
  Settings,
  Bell,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/data';
import SaveJobButton from '@/components/SaveJobButton';

interface UserProfile {
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type: string;
  is_newsletter_subscriber: boolean;
  is_verified: boolean;
  created_at?: string;
}

interface SavedJobWithDetails {
  id: string;
  job_id: string;
  saved_at: string;
  job_listings_db: {
    JobID: string;
    JobTitle: string;
    Company: string;
    Location: string;
    formatted_salary: string;
    slug: string;
    ShortDescription: string;
    PostedDate: string;
    JobType: string;
    is_remote: boolean;
    job_url: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        await fetchSavedJobs(session.user.id);
      } else {
        router.push('/login');
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        await fetchSavedJobs(session.user.id);
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_db')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
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
            JobType,
            is_remote,
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
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = userProfile?.first_name || user.user_metadata?.name?.split(' ')[0] || '';
  const lastName = userProfile?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/welcome" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900">Profile</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{fullName}</h1>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-blue-200">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  {userProfile?.is_verified && (
                    <span className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                href="/welcome"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User Type</label>
                  <p className="text-gray-900 capitalize">{userProfile?.user_type?.replace('_', ' ') || 'Job Seeker'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userProfile?.is_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {userProfile?.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Newsletter Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Job Alerts</p>
                    <p className="text-sm text-gray-600">Get notified about new six-figure opportunities</p>
                  </div>
                  <button
                    onClick={handleNewsletterToggle}
                    disabled={newsletterLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userProfile?.is_newsletter_subscriber
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } ${newsletterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {newsletterLoading ? 'Updating...' : (
                      userProfile?.is_newsletter_subscriber ? 'Unsubscribe' : 'Subscribe'
                    )}
                  </button>
                </div>
                {message && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Account Actions
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/preferences"
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-900">Job Preferences</span>
                  <span className="text-gray-400">→</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Saved Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BookmarkIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Saved Jobs ({savedJobs.length})
                </h2>
                <Link 
                  href="/jobs"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Link>
              </div>

              {savedJobsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading your saved jobs...</p>
                </div>
              ) : savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((savedJob) => {
                    const job = savedJob.job_listings_db;
                    if (!job) return null;
                    
                    return (
                      <div key={savedJob.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <Link 
                                href={`/jobs/${job.slug}`}
                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {job.JobTitle}
                              </Link>
                              <button
                                onClick={() => removeSavedJob(savedJob.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-4 p-1"
                                title="Remove from saved jobs"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-blue-600 font-medium mb-2">{job.Company}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{job.Location}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium text-green-600">{job.formatted_salary}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Saved {new Date(savedJob.saved_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{job.ShortDescription}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              Posted {formatDate(job.PostedDate)}
                            </span>
                            {job.is_remote && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Remote
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <SaveJobButton 
                              jobId={job.JobID} 
                              variant="bookmark" 
                              size="sm" 
                              showText={false}
                            />
                            <Link 
                              href={`/jobs/${job.slug}`}
                              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View
                            </Link>
                            <a
                              href={job.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                            >
                              Apply
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start browsing jobs and save the ones you're interested in. They'll appear here for easy access.
                  </p>
                  <Link 
                    href="/jobs"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BriefcaseIcon className="w-4 h-4 mr-2" />
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