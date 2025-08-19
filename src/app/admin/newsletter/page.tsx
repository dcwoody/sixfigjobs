// src/app/admin/newsletter/page.tsx - WITH ERROR BOUNDARY
'use client';

import React, { useState, useEffect } from 'react';
import { Send, Download, BarChart3, Users, Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface NewsletterStats {
  totalSubscribers: number;
  totalSent: number;
  lastSentDate: string | null;
}

interface NewsletterPreview {
  subject: string;
  htmlContent: string;
  jobsData: any[];
  stats: any;
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Newsletter admin error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-semibold mb-2">Application Error</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Something went wrong loading the newsletter admin panel.
                  </p>
                  <details className="text-red-600 text-sm">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error?.message || 'Unknown error'}
                    </pre>
                  </details>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminNewsletterContent() {
  const [stats, setStats] = useState<NewsletterStats>({ 
    totalSubscribers: 0, 
    totalSent: 0, 
    lastSentDate: null 
  });
  const [preview, setPreview] = useState<NewsletterPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState('');

  // Get the API secret with better error handling
  const getAPISecret = () => {
    try {
      if (typeof window === 'undefined') return null;
      
      // First try the known secret from your environment
      const knownSecret = 'NaxraKCT8NSVJNZVfpqDXomJmPtBDkw4EfbT7eFOBP9PN3VCOGJO';
      
      // Check if we have it stored
      const stored = localStorage.getItem('newsletter_api_secret');
      if (stored) return stored;
      
      // Try the known secret first
      localStorage.setItem('newsletter_api_secret', knownSecret);
      setSendStatus('🔑 Using configured API secret');
      return knownSecret;
      
    } catch (error) {
      console.error('Error getting API secret:', error);
      setSendStatus('❌ Error accessing API secret');
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      // Skip if we don't have an API secret
      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('⚠️ Newsletter API Secret required');
        return;
      }

      setSendStatus('📊 Loading stats...');

      const response = await fetch('/api/newsletter/stats', {
        headers: {
          'Authorization': `Bearer ${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure we have valid data with fallbacks
        setStats({
          totalSubscribers: data.totalSubscribers || 0,
          totalSent: data.totalSent || 0,
          lastSentDate: data.lastSentDate || null
        });
        setSendStatus('✅ Stats loaded successfully');
      } else {
        const errorText = await response.text();
        console.error('Stats fetch failed:', response.status, errorText);
        setSendStatus(`❌ Failed to fetch stats: ${response.status}`);
        // Keep default values if fetch fails
        setStats({ totalSubscribers: 0, totalSent: 0, lastSentDate: null });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setSendStatus(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Keep default values if fetch fails
      setStats({ totalSubscribers: 0, totalSent: 0, lastSentDate: null });
    }
  };

  useEffect(() => {
    try {
      fetchStats();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setSendStatus(`❌ Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const generatePreview = async () => {
    setLoading(true);
    setSendStatus('📝 Generating newsletter preview...');

    try {
      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('❌ Newsletter API Secret not configured');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/newsletter/generate-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setPreview(result);
      setSendStatus(`✅ Preview generated! Found ${result.jobsData?.length || 0} jobs to include.`);
    } catch (error) {
      console.error('Error generating preview:', error);
      setSendStatus(`❌ Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!preview) {
      setSendStatus('Please generate preview first');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this newsletter to ${stats?.totalSubscribers || 0} subscribers? This cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setSendStatus('📧 Sending newsletter to all subscribers...');

    try {
      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('❌ Newsletter API Secret not configured');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: preview.subject,
          htmlContent: preview.htmlContent,
          jobsData: preview.jobsData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setSendStatus(`✅ Newsletter sent! Delivered to ${result.stats?.sent || 0} subscribers. ${result.stats?.failed || 0} failed.`);
      fetchStats();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSendStatus(`❌ Failed to send newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNewsletter = async () => {
    if (!preview) {
      setSendStatus('Please generate preview first');
      return;
    }

    const testEmail = prompt('Enter your email address for test newsletter:');
    if (!testEmail) {
      setSendStatus('Test cancelled');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setSendStatus('❌ Please enter a valid email address');
      return;
    }

    setLoading(true);
    setSendStatus(`📧 Sending test newsletter to ${testEmail}...`);

    try {
      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('❌ Newsletter API Secret not configured');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/newsletter/test-send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          subject: preview.subject,
          htmlContent: preview.htmlContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setSendStatus(`✅ Test newsletter sent to ${testEmail}! Check your inbox.`);
    } catch (error) {
      console.error('Error sending test:', error);
      setSendStatus(`❌ Failed to send test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Administration</h1>
          <p className="text-gray-600 mt-2">Manage and send newsletters to subscribers</p>
        </div>

        {/* Environment Setup Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-blue-800 font-medium">Environment Variables Required</h3>
              <div className="text-blue-700 text-sm mt-1">
                <p>Make sure these are set in your deployment environment:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><code>RESEND_API_KEY</code> - Your Resend API key</li>
                  <li><code>NEWSLETTER_API_SECRET</code> - Secret for admin functions</li>
                  <li><code>CRON_SECRET</code> - Secret for automated newsletter sending</li>
                  <li><code>NEWSLETTER_FROM_EMAIL</code> - From email address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{(stats?.totalSubscribers || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{(stats?.totalSent || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Sent</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.lastSentDate ? new Date(stats.lastSentDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Newsletter Generation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Newsletter</h2>
            
            <div className="space-y-4">
              <button
                onClick={generatePreview}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                {loading ? 'Generating...' : 'Generate Preview'}
              </button>

              {preview && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">Preview Ready</h3>
                  <p className="text-sm text-gray-600 mb-1">Subject: {preview.subject}</p>
                  <p className="text-sm text-gray-600">Jobs included: {preview.jobsData?.length || 0}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={sendTestNewsletter}
                  disabled={loading || !preview}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </button>

                <button
                  onClick={sendNewsletter}
                  disabled={loading || !preview}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send to All
                </button>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Management</h2>
            
            <div className="space-y-3">
              <button
                onClick={fetchStats}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {sendStatus && (
          <div className={`mt-6 p-4 rounded-lg ${
            sendStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
            sendStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
            sendStatus.includes('⚠️') ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {sendStatus.includes('✅') ? <CheckCircle className="h-5 w-5" /> :
                 sendStatus.includes('❌') ? <AlertCircle className="h-5 w-5" /> :
                 sendStatus.includes('⚠️') ? <AlertCircle className="h-5 w-5" /> :
                 <Send className="h-5 w-5" />}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{sendStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Display */}
        {preview && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Newsletter Preview</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="mt-1 text-sm text-gray-900">{preview.subject}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: preview.htmlContent }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminNewsletterPage() {
  return (
    <ErrorBoundary>
      <AdminNewsletterContent />
    </ErrorBoundary>
  );
}