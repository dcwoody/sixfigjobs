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
    // Use the new admin-stats route instead
    const response = await fetch('/api/newsletter/admin-stats');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setStats(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Set default stats if API fails
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
    // Create a mock preview with real data from your database
    const mockPreview = {
      subject: `Weekly Six-Figure Jobs - ${new Date().toLocaleDateString()}`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Weekly Six-Figure Jobs</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <p>Hello {{firstName}},</p>
            <p>Here are this week's best six-figure opportunities curated just for you:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: center;">
                <div>
                  <div style="font-size: 24px; font-weight: 700; color: #2563eb;">5</div>
                  <div style="font-size: 14px; color: #64748b;">New This Week</div>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 700; color: #2563eb;">${stats.totalSubscribers}</div>
                  <div style="font-size: 14px; color: #64748b;">Total Subscribers</div>
                </div>
              </div>
            </div>
            
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Senior Software Engineer</div>
              <div style="color: #2563eb; font-weight: 500; margin-bottom: 4px;">TechCorp Inc.</div>
              <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">San Francisco, CA (Remote)</div>
              <div style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 10px;">$150K-$200K</div>
              <div style="color: #475569; font-size: 14px; line-height: 1.5;">Build scalable systems for millions of users. Work with cutting-edge technology stack.</div>
              <a href="https://www.sixfigjob.com/jobs/senior-engineer-techcorp" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 15px;">View Job Details</a>
            </div>
            
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Product Manager</div>
              <div style="color: #2563eb; font-weight: 500; margin-bottom: 4px;">InnovateCo</div>
              <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">New York, NY</div>
              <div style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 10px;">$140K-$180K</div>
              <div style="color: #475569; font-size: 14px; line-height: 1.5;">Lead product strategy for our flagship platform. Drive innovation and growth.</div>
              <a href="https://www.sixfigjob.com/jobs/product-manager-innovateco" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 15px;">View Job Details</a>
            </div>
            
            <p style="text-align: center;">
              <a href="https://www.sixfigjob.com/jobs" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0;">Browse All Jobs</a>
            </p>
            
            <p>Have a great week ahead!</p>
            <p>The SixFigJob Team</p>
          </div>
          
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
            <p>You're receiving this because you subscribed to our weekly newsletter.</p>
            <p>
              <a href="https://www.sixfigjob.com/unsubscribe?email={{email}}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> | 
              <a href="https://www.sixfigjob.com" style="color: #2563eb; text-decoration: none;">Visit Website</a>
            </p>
          </div>
        </div>
      `,
      jobsData: [
        {
          JobTitle: 'Senior Software Engineer',
          Company: 'TechCorp Inc.',
          Location: 'San Francisco, CA',
          formatted_salary: '$150K-$200K',
          is_remote: true
        },
        {
          JobTitle: 'Product Manager', 
          Company: 'InnovateCo',
          Location: 'New York, NY',
          formatted_salary: '$140K-$180K',
          is_remote: false
        }
      ],
      stats: { totalJobs: stats.totalSubscribers + 50, newJobs: 5 }
    };
    
    setPreview(mockPreview);
    setShowPreview(true);
    setSendStatus('✅ Mock preview generated successfully! (Demo mode)');
  } catch (error) {
    console.error('Error generating preview:', error);
    setSendStatus('❌ Failed to generate preview');
  } finally {
    setLoading(false);
  }
};

  const sendNewsletter = async () => {
  if (!preview) {
    setSendStatus('Please generate preview first');
    return;
  }

  setLoading(true);
  setSendStatus('Demo mode: Newsletter sending is disabled for safety.');
  
  // Simulate sending delay
  setTimeout(() => {
    setSendStatus(`📧 Demo: Would send newsletter to ${stats.totalSubscribers} subscribers. Set up RESEND_API_KEY and NEWSLETTER_API_SECRET to enable real sending.`);
    setLoading(false);
  }, 2000);
};

const exportSubscribers = async () => {
  try {
    setSendStatus('Generating subscriber export...');
    
    // Create a mock CSV export
    const csvContent = `Email,First Name,Last Name,User Type,Subscribed Date
demo@example.com,Demo,User,job_seeker,${new Date().toLocaleDateString()}
test@sixfigjob.com,Test,Subscriber,job_seeker,${new Date().toLocaleDateString()}
newsletter@example.org,Newsletter,Fan,job_seeker,${new Date().toLocaleDateString()}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-demo-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setSendStatus('✅ Demo export downloaded! Set up NEWSLETTER_API_SECRET for real subscriber data.');
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    setSendStatus('❌ Export failed');
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
          <div className={`p-4 rounded-lg mb-4 flex items-center ${
            sendStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
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
    </div>
  );
}