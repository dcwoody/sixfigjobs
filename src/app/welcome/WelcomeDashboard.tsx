// src/app/welcome/WelcomeDashboard.tsx - SIMPLIFIED WITH SINGLE AUTH SOURCE
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { 
  BookmarkIcon, 
  BriefcaseIcon, 
  CogIcon, 
  UserIcon,
  BarChart3Icon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  MailIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';

interface UserProfile {
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type: string;
  is_newsletter_subscriber: boolean;
  is_verified: boolean;
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
  };
}

interface JobStats {
  total_jobs: number;
  new_this_week: number;
  avg_salary: string;
}

interface WelcomeDashboardProps {
  initialSession: Session;
  initialProfile: UserProfile | null;
}

export default function WelcomeDashboard({ initialSession, initialProfile }: WelcomeDashboardProps) {
  const router = useRouter();
  
  const [session, setSession] = useState<Session>(initialSession);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([]);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    // Use session.user consistently throughout
    const currentUser = session.user;
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // If no profile, create one
    if (!userProfile) {
      createUserProfile(currentUser.id);
    } else {
      fetchDashboardData(currentUser.id);
    }

    // Fetch saved jobs with details
    fetchSavedJobsWithDetails(currentUser.id);

    // Set up auth listener that updates session state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('Auth state changed in dashboard:', _event, newSession?.user?.email);
      
      if (_event === 'SIGNED_OUT' || !newSession) {
        router.push('/login');
      } else if (newSession) {
        setSession(newSession);
        // Update profile and data when session changes
        if (newSession.user.id !== currentUser.id) {
          fetchUserProfile(newSession.user.id);
          fetchDashboardData(newSession.user.id);
          fetchSavedJobsWithDetails(newSession.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [session.user?.id, userProfile, router]);

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
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const newProfile = {
        auth_user_id: userId,
        email: session.user.email || '',
        first_name: session.user.user_metadata?.name?.split(' ')[0] || '',
        last_name: session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        user_type: 'job_seeker',
        is_newsletter_subscriber: false,
        is_verified: true
      };

      const { data: createdProfile, error } = await supabase
        .from('users_db')
        .insert([newProfile])
        .select()
        .single();

      if (!error && createdProfile) {
        setUserProfile(createdProfile);
        fetchDashboardData(userId);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const fetchSavedJobsWithDetails = async (userId: string) => {
    try {
      const { data: savedJobsData, error: savedJobsError } = await supabase
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
            slug
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .limit(3);

      if (!savedJobsError && savedJobsData) {
        const transformedJobs = savedJobsData?.map((item: any) => ({
          id: item.id,
          job_id: item.job_id,
          saved_at: item.saved_at,
          job_listings_db: Array.isArray(item.job_listings_db) 
            ? item.job_listings_db[0] 
            : item.job_listings_db
        })) || [];
        setSavedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching saved jobs with details:', error);
    }
  };

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch job statistics
      const { count: totalJobs } = await supabase
        .from('job_listings_db')
        .select('*', { count: 'exact', head: true });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newJobs } = await supabase
        .from('job_listings_db')
        .select('*', { count: 'exact', head: true })
        .gte('PostedDate', oneWeekAgo.toISOString());

      setJobStats({
        total_jobs: totalJobs || 0,
        new_this_week: newJobs || 0,
        avg_salary: '$150K+',
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

      if (error) {
        console.error('Error updating newsletter subscription:', error);
        setNewsletterMessage('Failed to update subscription. Please try again.');
      } else {
        setNewsletterMessage(
          newStatus 
            ? '✅ Successfully subscribed to weekly job alerts!' 
            : '📭 Unsubscribed from newsletter.'
        );
        
        setUserProfile(prev => prev ? { ...prev, is_newsletter_subscriber: newStatus } : null);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMessage('An error occurred. Please try again.');
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => setNewsletterMessage(''), 3000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return null; // Will redirect to login
  }

  const firstName = userProfile?.first_name || session.user?.email?.split('@')[0] || 'there';
  const userEmail = userProfile?.email || session.user?.email;
  const isNewsletterSubscribed = userProfile?.is_newsletter_subscriber || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Ready to discover your next six-figure opportunity?
                  </p>
                  <p className="text-blue-200 text-sm mt-2">{userEmail}</p>
                </div>
                <div className="flex space-x-4 mt-6 md:mt-0">
                  <Link
                    href="/jobs"
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <BriefcaseIcon className="w-5 h-5 mr-2" />
                    Browse Jobs
                  </Link>
                  <Link
                    href="/newsletter"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center"
                  >
                    <MailIcon className="w-5 h-5 mr-2" />
                    Join Newsletter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recently Saved Jobs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BookmarkIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Recently Saved Jobs
                  </h2>
                  <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
                    View All
                  </Link>
                </div>
                
                {savedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.map((savedJob) => {
                      const job = savedJob.job_listings_db;
                      if (!job) return null;
                      
                      return (
                        <div key={savedJob.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start">
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
                                  className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                                  title="Remove from saved jobs"
                                >
                                  <XIcon className="w-5 h-5" />
                                </button>
                              </div>
                              <p className="text-gray-600 flex items-center mt-1">
                                <BriefcaseIcon className="w-4 h-4 mr-1" />
                                {job.Company}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                                <span className="flex items-center">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  {job.Location}
                                </span>
                                <span className="flex items-center">
                                  <ClockIcon className="w-4 h-4 mr-1" />
                                  Saved {new Date(savedJob.saved_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-green-600">{job.formatted_salary}</p>
                              <Link 
                                href={`/jobs/${job.slug}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mt-1"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                    <p className="text-gray-600 mb-4">Start browsing and save jobs you're interested in!</p>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>

              {/* Job Market Stats */}
              {jobStats && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <BarChart3Icon className="w-6 h-6 mr-2 text-blue-600" />
                    Job Market Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{jobStats.total_jobs.toLocaleString()}</div>
                      <div className="text-blue-800 font-medium">Total Jobs</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{jobStats.new_this_week}</div>
                      <div className="text-green-800 font-medium">New This Week</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{jobStats.avg_salary}</div>
                      <div className="text-purple-800 font-medium">Average Salary</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <BookmarkIcon className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium">Saved Jobs</div>
                      <div className="text-sm text-blue-600">View your bookmarked positions</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/preferences"
                    className="flex items-center p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <CogIcon className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium">Job Preferences</div>
                      <div className="text-sm text-gray-600">Set your criteria and alerts</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Weekly job alerts</p>
                      <p className="text-sm text-gray-600">
                        {isNewsletterSubscribed ? 'Subscribed ✓' : 'Not subscribed'}
                      </p>
                    </div>
                    <button
                      onClick={handleNewsletterToggle}
                      disabled={newsletterLoading}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isNewsletterSubscribed
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {newsletterLoading ? 'Updating...' : (
                        isNewsletterSubscribed ? 'Unsubscribe' : 'Subscribe Now'
                      )}
                    </button>
                  </div>
                  {newsletterMessage && (
                    <p className="text-sm text-green-600">{newsletterMessage}</p>
                  )}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basic info</span>
                    <span className="text-green-600 font-medium">✓ Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Newsletter subscription</span>
                    <span className={`font-medium ${isNewsletterSubscribed ? 'text-green-600' : 'text-gray-400'}`}>
                      {isNewsletterSubscribed ? '✓ Complete' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Job preferences</span>
                    <Link href="/preferences" className="text-blue-600 font-medium">Set up →</Link>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${isNewsletterSubscribed ? '75%' : '50%'}`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isNewsletterSubscribed ? '75%' : '50%'} complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}