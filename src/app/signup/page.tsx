// src/app/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Briefcase } from 'lucide-react'

interface FormData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'job_seeker' | 'employer'
  companyName: string
  companySize: string
  industry: string
  isNewsletterSubscriber: boolean
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'job_seeker',
    companyName: '',
    companySize: '',
    industry: '',
    isNewsletterSubscriber: true
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setErrorMsg('')

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_type: formData.userType,
          ...(formData.userType === 'employer' && {
            company_name: formData.companyName,
            company_size: formData.companySize,
            industry: formData.industry
          }),
          newsletter_subscriber: formData.isNewsletterSubscriber
        }
      }
    })

    if (error) {
      setErrorMsg(error.message)
    } else if (data.user) {
      // Check if email confirmation is required
      if (data.user.email_confirmed_at) {
        // User is immediately confirmed (auto-confirm enabled)
        router.push('/welcome')
      } else {
        // User needs to confirm email - redirect to check email page
        router.push('/auth/check-email')
      }
    }
  } catch (error) {
    setErrorMsg('An unexpected error occurred. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const handleGoogleSignup = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
      queryParams: {
        user_type: formData.userType,
        newsletter: formData.isNewsletterSubscriber.toString(),
      }
    },
  })

  if (error) {
    setErrorMsg(error.message)
  }
}

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Best Work Starts Here
            </h1>
            <p className="text-gray-600">
              Join thousands of professionals landing six-figure opportunities
            </p>
          </div>

          {/* Social Sign Up - Google Only */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
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
                <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${formData.userType === 'job_seeker'
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

                <label className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${formData.userType === 'employer'
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
                    <span className="block text-xs text-gray-600">Hire top talent</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Employer Fields */}
            {formData.userType === 'employer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
            <p className="text-center text-sm text-gray-600 mb-8">
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

          {/* Features */}
          <div className="grid gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-100">Exclusive six-figure job opportunities</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-100">Connect with top-tier companies</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-100">Advanced matching algorithms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}