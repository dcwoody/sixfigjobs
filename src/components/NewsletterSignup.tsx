// src/components/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2, TrendingUp, Users, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users_db')
        .select('id, is_newsletter_subscriber, first_name, email')
        .eq('email', email)
        .single();

      if (existingUser) {
        if (existingUser.is_newsletter_subscriber) {
          setError('You\'re already subscribed to our newsletter!');
          setLoading(false);
          return;
        } else {
          // Update existing user to subscribe
          const { error: updateError } = await supabase
            .from('users_db')
            .update({ 
              is_newsletter_subscriber: true,
              first_name: firstName || existingUser.first_name 
            })
            .eq('id', existingUser.id);

          if (updateError) {
            console.error('Newsletter update error:', updateError);
            setError('Failed to subscribe. Please try again.');
            setLoading(false);
            return;
          }
        }
      } else {
        // Create new newsletter-only subscriber
        const { error: insertError } = await supabase
          .from('users_db')
          .insert([{
            email,
            first_name: firstName || '',
            last_name: '',
            user_type: 'job_seeker',
            is_newsletter_subscriber: true,
            is_verified: true, // Auto-verify newsletter signups
            auth_user_id: null // No auth account, just newsletter
          }]);

        if (insertError) {
          console.error('Newsletter signup error:', insertError);
          setError('Failed to subscribe. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Success!
      setSuccess(true);
      setEmail('');
      setFirstName('');
      
      // Reset success state after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (error) {
      console.error('Newsletter signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Weekly Newsletter
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Get the best{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                six-figure jobs
              </span>{' '}
              delivered weekly
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 25,000+ ambitious professionals getting curated $100k+ opportunities, 
              salary insights, and career advice delivered to their inbox every Monday.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">New jobs weekly</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$180k</div>
              <div className="text-gray-600">Average salary</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25k+</div>
              <div className="text-gray-600">Subscribers</div>
            </div>
          </div>

          {/* Success State */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                🎉 Welcome to the SixFigHires community!
              </h3>
              <p className="text-green-800">
                Check your inbox for a confirmation email. Your first newsletter will arrive next Monday 
                with fresh six-figure opportunities curated just for you.
              </p>
            </div>
          )}

          {/* Signup Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <input
                      type="text"
                      placeholder="First name (optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2 inline" />
                      Get Weekly Jobs
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 mt-4">
                  No spam. Unsubscribe anytime. Join 25,000+ professionals already subscribed.
                </p>
              </div>
            </form>
          )}

          {/* Social Proof */}
          {!success && (
            <div className="mt-12">
              <p className="text-sm text-gray-600 mb-6">Trusted by professionals at:</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                {['Google', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Amazon'].map((company) => (
                  <div key={company} className="bg-gray-100 px-4 py-2 rounded-lg">
                    <span className="text-gray-600 font-medium">{company}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}