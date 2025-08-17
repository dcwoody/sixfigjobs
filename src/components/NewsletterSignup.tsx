// src/components/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2, Calendar, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendWelcomeEmail } from '@/lib/newsletter';

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
      console.log('Attempting newsletter signup for:', email);
      
      // Check if user already exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users_db')
        .select('id, is_newsletter_subscriber, first_name, email')
        .eq('email', email)
        .single();

      console.log('Existing user query result:', { existingUser, selectError });

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 means "not found" which is expected for new users
        console.error('Database select error:', selectError);
        setError('Database connection error. Please try again.');
        setLoading(false);
        return;
      }

      if (existingUser) {
        console.log('User exists, checking subscription status');
        if (existingUser.is_newsletter_subscriber) {
          setError('You\'re already subscribed to our newsletter!');
          setLoading(false);
          return;
        } else {
          console.log('Updating existing user to subscribe');
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
            setError(`Update failed: ${updateError.message}`);
            setLoading(false);
            return;
          }
        }
      } else {
        console.log('Creating new newsletter subscriber');
        // Create new newsletter-only subscriber
        const { error: insertError } = await supabase
          .from('users_db')
          .insert([{
            email,
            first_name: firstName || '',
            last_name: '',
            user_type: 'job_seeker',
            is_newsletter_subscriber: true,
            is_verified: true
          }]);

        if (insertError) {
          console.error('Newsletter signup error:', insertError);
          setError(`Signup failed: ${insertError.message}`);
          setLoading(false);
          return;
        }
      }

      console.log('Newsletter signup successful!');

      // Send welcome email for new subscribers
      try {
        await sendWelcomeEmail(email, firstName);
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Don't fail the signup if welcome email fails
      }

      // Success!
      setSuccess(true);
      setEmail('');
      setFirstName('');
      
      setTimeout(() => setSuccess(false), 5000);

    } catch (error) {
      console.error('Newsletter signup error:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="newsletter" className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-green-600 rounded-2xl p-8 text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Welcome to the team! 🎉</h2>
              <p className="text-xl text-green-100 mb-6">
                You're now subscribed to our weekly six-figure jobs newsletter. 
                Check your email for a welcome message!
              </p>
              <div className="bg-green-700/30 rounded-lg p-4 text-green-100">
                <p className="text-sm">
                  📧 Your first newsletter arrives next Monday morning<br />
                  💼 Meanwhile, browse our current job listings
                </p>
              </div>
              <a 
                href="/jobs"
                className="inline-block mt-6 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Browse Jobs Now
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="newsletter" className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Content */}
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get the best six-figure jobs weekly
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join 25,000+ ambitious professionals getting curated $100k+ opportunities, 
                salary insights, and career advice delivered every Monday.
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Weekly delivery</h3>
                    <p className="text-gray-400 text-sm">
                      Curated opportunities delivered every Monday morning to start your week right.
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
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Start your career upgrade
                </h3>
                <p className="text-gray-600">
                  Join thousands who've found their dream job through our newsletter
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your first name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="you@company.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Subscribe Free
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to receive our weekly newsletter. 
                  Unsubscribe at any time. No spam, ever.
                </p>
              </form>

              {/* Social Proof */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    25,000+ subscribers
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    65% open rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}