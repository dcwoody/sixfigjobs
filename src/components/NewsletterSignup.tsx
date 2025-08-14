// src/components/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2, Calendar, Shield } from 'lucide-react';
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
    <section id="newsletter" className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Content */}
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Subscribe to our newsletter
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Get the best six-figure jobs delivered weekly. Join 25,000+ ambitious professionals 
                getting curated $100k+ opportunities, salary insights, and career advice.
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Weekly articles</h3>
                    <p className="text-gray-400 text-sm">
                      Curated job opportunities and career insights delivered every Monday morning.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">No spam</h3>
                    <p className="text-gray-400 text-sm">
                      Quality over quantity. Unsubscribe anytime with a single click.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div>
              {/* Success State */}
              {success && (
                <div className="bg-green-900/50 border border-green-500/50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    🎉 Welcome to SixFigHires!
                  </h3>
                  <p className="text-green-300">
                    Check your inbox for confirmation. Your first newsletter arrives next Monday.
                  </p>
                </div>
              )}

              {/* Signup Form */}
              {!success && (
                <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="First name (optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-300 text-sm">
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
                        Subscribe
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-400 mt-4 text-center">
                    No spam. Unsubscribe anytime. Join 25,000+ professionals.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}