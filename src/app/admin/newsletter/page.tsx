// src/app/admin/newsletter/page.tsx - FIXED VERSION
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

export default function AdminNewsletterPage() {
  const [stats, setStats] = useState<NewsletterStats>({ totalSubscribers: 0, totalSent: 0, lastSentDate: null });
  const [preview, setPreview] = useState<NewsletterPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState('');

  // Get the API secret from environment (this should be set on the server)
  const getAPISecret = () => {
    // In production, this should come from server-side environment variables
    // For now, we'll use a fixed secret or prompt the user
    return localStorage.getItem('newsletter_api_secret') || prompt('Enter Newsletter API Secret:');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('❌ Newsletter API Secret not configured');
        return;
      }

      const response = await fetch('/api/newsletter/stats', {
        headers: {
          'Authorization': `Bearer ${apiSecret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    setSendStatus('Generating newsletter preview...');

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

      const result = await response.json();

      if (response.ok) {
        setPreview(result);
        setSendStatus(`✅ Preview generated! Found ${result.jobsData.length} jobs to include.`);
      } else {
        setSendStatus(`❌ Failed to generate preview: ${result.error}`);
      }
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
      `Are you sure you want to send this newsletter to ${stats.totalSubscribers} subscribers? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setSendStatus('Sending newsletter to all subscribers...');

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

      const result = await response.json();

      if (response.ok) {
        setSendStatus(`✅ Newsletter sent successfully! Delivered to ${result.stats?.sent || 0} subscribers. ${result.stats?.failed || 0} failed.`);
        fetchStats();
      } else {
        setSendStatus(`❌ Failed to send newsletter: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSendStatus('❌ Failed to send newsletter. Check console for details.');
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
    if (!testEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setSendStatus('❌ Please enter a valid email address');
      return;
    }

    setLoading(true);
    setSendStatus(`Sending test newsletter to ${testEmail}...`);

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
          testEmail,
          subject: preview.subject,
          htmlContent: preview.htmlContent
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSendStatus(`✅ Test newsletter sent to ${testEmail}! Check your inbox.`);
      } else {
        setSendStatus(`❌ Failed to send test: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test:', error);
      setSendStatus('❌ Failed to send test newsletter');
    } finally {
      setLoading(false);
    }
  };

  const exportSubscribers = async () => {
    try {
      setSendStatus('Exporting subscriber list...');

      const apiSecret = getAPISecret();
      if (!apiSecret) {
        setSendStatus('❌ Newsletter API Secret not configured');
        return;
      }

      const response = await fetch('/api/newsletter/export', {
        headers: {
          'Authorization': `Bearer ${apiSecret}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSendStatus('✅ Subscriber list exported successfully!');
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      setSendStatus(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testWeeklyAutomation = async () => {
    setLoading(true);
    setSendStatus('Testing weekly automation...');

    try {
      // Use the CRON_SECRET for automation testing
      const cronSecret = localStorage.getItem('cron_secret') || prompt('Enter CRON Secret:');
      if (!cronSecret) {
        setSendStatus('❌ CRON Secret not configured');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/newsletter/cron', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSendStatus(`✅ Weekly automation test successful! ${result.summary ? `Jobs: ${result.summary.jobsIncluded}, Sent: ${result.summary.subscribersSent}` : ''}`);
      } else {
        setSendStatus(`❌ Weekly automation test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing automation:', error);
      setSendStatus('❌ Failed to test weekly automation');
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Sent</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.lastSentDate ? new Date(stats.lastSentDate).toLocaleDateString() : 'Never'}
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
                  <p className="text-sm text-gray-600">Jobs included: {preview.jobsData.length}</p>
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
                onClick={exportSubscribers}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Subscribers
              </button>

              <button
                onClick={testWeeklyAutomation}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Weekly Automation
              </button>

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
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {sendStatus.includes('✅') ? <CheckCircle className="h-5 w-5" /> :
                 sendStatus.includes('❌') ? <AlertCircle className="h-5 w-5" /> :
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