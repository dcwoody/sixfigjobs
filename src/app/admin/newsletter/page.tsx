// src/app/admin/newsletter/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  Send,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { NewsletterTestPanel } from '@/components/NewsletterTestPanel';

interface NewsletterStats {
  totalSubscribers: number;
  newThisWeek: number;
  lastSentDate: string;
  openRate: number;
}

interface NewsletterPreview {
  subject: string;
  htmlContent: string;
  jobsData: any[];
  stats: any;
}

export default function AdminNewsletterPage() {
  const [stats, setStats] = useState<NewsletterStats>({
    totalSubscribers: 0,
    newThisWeek: 0,
    lastSentDate: '',
    openRate: 0
  });

  const [preview, setPreview] = useState<NewsletterPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/newsletter/admin-stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalSubscribers: 0,
        newThisWeek: 0,
        lastSentDate: '',
        openRate: 0
      });
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/generate-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_SECRET}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate content: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setPreview(data);
      setShowPreview(true);
      setSendStatus('✅ Newsletter preview generated successfully!');
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
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_SECRET}`,
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
        setSendStatus(`✅ Newsletter sent successfully! Delivered to ${result.stats.sent} subscribers. ${result.stats.failed} failed.`);
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

  const exportSubscribers = async () => {
    try {
      setSendStatus('Exporting subscriber list...');

      const response = await fetch('/api/newsletter/export', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_SECRET}`
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
      const response = await fetch('/api/newsletter/test-send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_SECRET}`,
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

  const testWeeklyAutomation = async () => {
    setLoading(true);
    setSendStatus('Testing weekly automation...');

    try {
      const response = await fetch('/api/newsletter/cron', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setSendStatus(`✅ Weekly automation test successful! Sent to ${result.summary.subscribersSent} subscribers.`);
        fetchStats(); // Refresh stats
      } else {
        setSendStatus(`❌ Automation test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing automation:', error);
      setSendStatus('❌ Failed to test weekly automation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Management</h1>
        <p className="text-gray-600">Manage your weekly newsletter and subscriber communications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-green-600">+{stats.newThisWeek}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Sent</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.lastSentDate ? new Date(stats.lastSentDate).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.openRate}%</p>
            </div>
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Test Panel */}
      <NewsletterTestPanel />

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Actions</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={generatePreview}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Generate Preview
          </button>

          <button
            onClick={sendTestNewsletter}
            disabled={loading || !preview}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Test to Me
          </button>

          <button
            onClick={sendNewsletter}
            disabled={loading || !preview}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Newsletter
          </button>

          <button
            onClick={exportSubscribers}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Subscribers
          </button>

          <button
            onClick={fetchStats}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </button>
        </div>

        {/* Status Messages */}
        {sendStatus && (
          <div className={`p-4 rounded-lg mb-4 flex items-center ${sendStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
              sendStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
            {sendStatus.includes('✅') ? <CheckCircle className="h-5 w-5 mr-2" /> :
              sendStatus.includes('❌') ? <AlertCircle className="h-5 w-5 mr-2" /> :
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />}
            {sendStatus}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && preview && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Newsletter Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Subject Line:</p>
            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded border">{preview.subject}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Jobs Included: {preview.jobsData.length}</p>
            <div className="space-y-2">
              {preview.jobsData.slice(0, 3).map((job, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded border">
                  <p className="font-medium">{job.JobTitle} at {job.Company}</p>
                  <p className="text-sm text-gray-600">{job.Location} • {job.formatted_salary}</p>
                </div>
              ))}
              {preview.jobsData.length > 3 && (
                <p className="text-sm text-gray-500">...and {preview.jobsData.length - 3} more jobs</p>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <p className="text-sm font-medium text-gray-700">HTML Preview:</p>
            </div>
            <div
              className="p-4 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: preview.htmlContent.replace('{{firstName}}', 'John') }}
            />
          </div>
        </div>
      )}

      {/* Subscriber Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Active Subscribers</h3>
            <p className="text-2xl font-bold text-green-600">{stats.totalSubscribers}</p>
            <p className="text-sm text-gray-600">Receiving newsletters</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Growth Rate</h3>
            <p className="text-2xl font-bold text-blue-600">+{((stats.newThisWeek / Math.max(stats.totalSubscribers, 1)) * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">This week</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Engagement</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.openRate}%</p>
            <p className="text-sm text-gray-600">Average open rate</p>
          </div>
        </div>
      </div>

      <button
        onClick={testWeeklyAutomation}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Test Weekly Automation
      </button>

    </div>
  );
}