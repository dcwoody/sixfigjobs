// src/app/admin/newsletter/test.tsx - Simple test to debug the issue
'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function AdminNewsletterTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPIConnection = async () => {
    setLoading(true);
    setTestResult('🔄 Testing API connection...');

    const apiSecret = 'NaxraKCT8NSVJNZVfpqDXomJmPtBDkw4EfbT7eFOBP9PN3VCOGJO';

    try {
      console.log('Testing with API secret:', apiSecret.substring(0, 10) + '...');

      // Test 1: Check if the stats endpoint exists
      const response = await fetch('/api/newsletter/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setTestResult(`✅ API connection successful! Subscribers: ${data.totalSubscribers || 0}`);
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        setTestResult(`❌ API Error (${response.status}): ${errorText}`);
      }

    } catch (error) {
      console.error('Network error:', error);
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testGenerateContent = async () => {
    setLoading(true);
    setTestResult('🔄 Testing content generation...');

    const apiSecret = 'NaxraKCT8NSVJNZVfpqDXomJmPtBDkw4EfbT7eFOBP9PN3VCOGJO';

    try {
      const response = await fetch('/api/newsletter/generate-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Content generation successful! Found ${data.jobsData?.length || 0} jobs`);
      } else {
        const errorText = await response.text();
        setTestResult(`❌ Content Generation Error (${response.status}): ${errorText}`);
      }

    } catch (error) {
      setTestResult(`❌ Content Generation Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Newsletter API Test</h1>
          <p className="text-gray-600 mt-2">Debug the newsletter admin panel issues</p>
        </div>

        {/* API Secret Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-blue-800 font-medium mb-2">API Secret Configuration</h3>
          <div className="text-blue-700 text-sm">
            <p>Using API Secret: NaxraKCT8NSVJNZVfpqDXomJmPtBDkw4EfbT7eFOBP9PN3VCOGJO</p>
            <p className="mt-1">Make sure this matches your NEWSLETTER_API_SECRET environment variable</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Tests</h2>
          
          <div className="space-y-4">
            <button
              onClick={testAPIConnection}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {loading ? 'Testing...' : 'Test Stats API'}
            </button>

            <button
              onClick={testGenerateContent}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? 'Testing...' : 'Test Content Generation'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
            testResult.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {testResult.includes('✅') ? <CheckCircle className="h-5 w-5" /> :
                 testResult.includes('❌') ? <AlertCircle className="h-5 w-5" /> :
                 <Send className="h-5 w-5" />}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{testResult}</p>
              </div>
            </div>
          </div>
        )}

        {/* Environment Check */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables Check</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Required on server:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>NEWSLETTER_API_SECRET=NaxraKCT8NSVJNZVfpqDXomJmPtBDkw4EfbT7eFOBP9PN3VCOGJO</li>
              <li>RESEND_API_KEY=your_resend_key</li>
              <li>NEWSLETTER_FROM_EMAIL=newsletter@yourdomain.com</li>
            </ul>
            <p className="mt-4"><strong>Files to check:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>.env.local (local development)</li>
              <li>Vercel environment variables (production)</li>
              <li>supabase/docker/.env (if using Docker)</li>
            </ul>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">Debugging Tips</h3>
              <div className="text-yellow-700 text-sm mt-1">
                <p>1. Open browser console (F12) to see detailed error logs</p>
                <p>2. Check Network tab to see API request/response details</p>
                <p>3. Verify your environment variables are set correctly</p>
                <p>4. Make sure your API routes exist in src/app/api/newsletter/</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}