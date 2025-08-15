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

    setLoading(true);
    setResult('Sending test email...');

    try {
      const response = await fetch('/api/newsletter/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail, testType })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ ${data.error || 'Test failed'}`);
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
        Test Newsletter System
      </h3>
      
      <div className="space-y-4">
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
            Test Welcome Email
          </button>

          <button
            onClick={() => sendTest('newsletter')}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Newsletter
          </button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg flex items-center ${
            result.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
            result.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {result.includes('✅') ? <CheckCircle className="h-5 w-5 mr-2" /> :
             result.includes('❌') ? <AlertCircle className="h-5 w-5 mr-2" /> :
             <Send className="h-5 w-5 mr-2" />}
            {result}
          </div>
        )}
      </div>
    </div>
  );
}