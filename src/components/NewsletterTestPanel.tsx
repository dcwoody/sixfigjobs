// Replace your NewsletterTestPanel component with this version:
// src/components/NewsletterTestPanel.tsx

'use client';

import React, { useState } from 'react';
import { Send, TestTube, CheckCircle, AlertCircle } from 'lucide-react';

export function NewsletterTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const sendTest = async (testType: 'welcome' | 'newsletter') => {
    if (!testEmail) {
      setResult('❌ Please enter a test email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setResult('❌ Please enter a valid email address');
      return;
    }

    setLoading(true);
    setResult('Simulating email send...');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (testType === 'welcome') {
        setResult(`✅ Demo: Welcome email would be sent to ${testEmail}. Set up RESEND_API_KEY to enable real email sending.`);
      } else {
        setResult(`✅ Demo: Newsletter test would be sent to ${testEmail}. Set up RESEND_API_KEY and NEWSLETTER_API_SECRET to enable real email sending.`);
      }
    } catch (error) {
      setResult('❌ Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TestTube className="h-5 w-5 mr-2 text-purple-600" />
        Test Newsletter System (Demo Mode)
      </h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-sm">
            📧 Demo mode: Tests will simulate email sending. To enable real emails, set up RESEND_API_KEY in your environment variables.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => sendTest('welcome')}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Test Welcome Email'}
          </button>

          <button
            onClick={() => sendTest('newsletter')}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Test Newsletter'}
          </button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg flex items-start ${
            result.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
            result.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {result.includes('✅') ? <CheckCircle className="h-4 w-4" /> :
               result.includes('❌') ? <AlertCircle className="h-4 w-4" /> :
               <Send className="h-4 w-4" />}
            </div>
            <div className="ml-2 text-sm">
              {result}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Get a Resend API key at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a></li>
            <li>• Add RESEND_API_KEY to your Vercel environment variables</li>
            <li>• Add NEWSLETTER_API_SECRET for admin functions</li>
            <li>• Verify your domain in Resend for better deliverability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}