// src/app/signup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'job_seeker', // 'job_seeker' or 'employer'
    companyName: '',
    companyWebsite: '',
    industry: '',
    isNewsletterSubscriber: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.userType === 'employer' && !formData.companyName) {
      setErrorMsg('Company name is required for employer accounts');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: formData.userType,
          }
        }
      });

      if (authError) {
        setErrorMsg(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMsg('Failed to create account');
        setLoading(false);
        return;
      }

      // 2. Create user profile in users_db
      const userProfileData = {
        auth_user_id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType,
        is_newsletter_subscriber: formData.isNewsletterSubscriber,
        is_verified: false,
        ...(formData.userType === 'employer' && {
          company_name: formData.companyName,
          company_website: formData.companyWebsite,
          industry: formData.industry,
        })
      };

      const { error: profileError } = await supabase
        .from('users_db')
        .insert([userProfileData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setErrorMsg('Account created but profile setup failed. Please contact support.');
        setLoading(false);
        return;
      }

      // 3. Create employer profile if needed
      if (formData.userType === 'employer') {
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .insert([{
            user_id: authData.user.id,
            company_description: '',
            subscription_plan: 'free',
            jobs_posted_count: 0,
          }]);

        if (employerError) {
          console.error('Employer profile creation error:', employerError);
          // Don't fail the signup for this, just log it
        }
      }

      // Success - redirect to welcome page
      router.push('/welcome');

    } catch (error) {
      console.error('Signup error:', error);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          user_type: formData.userType,
          newsletter: formData.isNewsletterSubscriber.toString(),
        }
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleAppleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          user_type: formData.userType,
          newsletter: formData.isNewsletterSubscriber.toString(),
        }
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                SixFigHires
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Best Work Starts Here
            </h1>
            <p className="text-gray-600">
              Join thousands of professionals landing six-figure opportunities
            </p>
          </div>

          {/* Social Sign Up */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
            
            <button
              onClick={handleAppleSignup}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                <path d="M15.53 3.83c.893-1.09 1.479-2.58 1.309-4.081-1.297.052-2.869.869-3.8 1.947-.832.952-1.56 2.471-1.364 3.931 1.448.111 2.927-.74 3.855-1.797z"/>
              </svg>
              Sign up with Apple
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSignup}>
            {errorMsg && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{errorMsg}</div>
              </div>
            )}

            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                What should we call you?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  formData.userType === 'job_seeker' 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="job_seeker"
                    checked={formData.userType === 'job_seeker'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-gray-900">Job Seeker</span>
                    <span className="block text-xs text-gray-600">Find six-figure opportunities</span>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  formData.userType === 'employer' 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="employer"
                    checked={formData.userType === 'employer'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-gray-900">Employer</span>
                    <span className="block text-xs text-gray-600">Post premium jobs</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="First Name"
                />
              </div>
              <div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Your email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="name@company.com"
              />
            </div>

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Your password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="Confirm password"
              />
            </div>

            {/* Employer-specific fields */}
            {formData.userType === 'employer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company Website</label>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="consulting">Consulting</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <div className="text-sm">
                  <span className="text-gray-900">
                    By signing up, you are creating a SixFigHires account, and you agree to SixFigHires's{' '}
                  </span>
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Use
                  </Link>
                  <span className="text-gray-900"> and </span>
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-900">.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="isNewsletterSubscriber"
                  checked={formData.isNewsletterSubscriber}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm text-gray-900">
                  Email me about product updates and resources.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600 focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create an account'}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Marketing Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-800/90"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg text-center text-white">
          {/* Logo */}
          <div className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">SixFigHires</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Discover the world's leading{' '}
            <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              six-figure opportunities
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Thousands of professionals and companies around the world showcase their career opportunities on SixFigHires - the home to the world's best jobs and top talent.
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400 border-2 border-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Over 25.7k Happy Professionals</div>
              <div className="flex items-center space-x-1 text-yellow-200">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="ml-2 text-sm">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 text-left">
            {[
              "Access to exclusive six-figure positions",
              "Direct connections with hiring managers", 
              "AI-powered job matching technology",
              "Premium salary negotiation resources"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold">$180K+</div>
              <div className="text-blue-200 text-sm">Average Salary</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-200 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}