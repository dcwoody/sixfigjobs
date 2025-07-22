// src/app/preferences/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function PreferencesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    desiredRoles: '',
    preferredLocations: '',
    salaryRange: '',
    jobTypes: '',
  });
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setSession(data.session);
        setLoading(false);
        // TODO: Load user preferences here from Supabase
      }
    };
    getSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save preferences to Supabase
    alert('Preferences saved (not yet implemented).');
  };

  if (loading || !session) {
    return <div className="min-h-screen bg-gray-50">Loading...</div>;
  }

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Preferences</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="desiredRoles">Desired Roles</label>
                <input
                  id="desiredRoles"
                  name="desiredRoles"
                  type="text"
                  value={formData.desiredRoles}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredLocations">Preferred Locations</label>
                <input
                  id="preferredLocations"
                  name="preferredLocations"
                  type="text"
                  value={formData.preferredLocations}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="salaryRange">Salary Range</label>
                <input
                  id="salaryRange"
                  name="salaryRange"
                  type="text"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="jobTypes">Job Types</label>
                <select
                  id="jobTypes"
                  name="jobTypes"
                  value={formData.jobTypes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
