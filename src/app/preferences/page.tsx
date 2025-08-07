// src/app/preferences/page.tsx
'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AuthContext } from '@/components/AuthProvider';
import Hero from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function PreferencesPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!auth?.session || !auth?.userInfo) {
      router.push('/login');
    }
  }, [auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.session || !auth?.userInfo) return;

    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('users_db')
      .update({ preferred_role: role, preferred_salary: salary, preferred_location: location })
      .eq('auth_user_id', auth.userInfo.id);

    setLoading(false);
    if (!error) {
      setSuccess(true);
    } else {
      console.error('Error saving preferences:', error.message);
    }
  };

  if (!auth?.session || !auth?.userInfo) {
    return <div className="min-h-screen bg-gray-50 p-10 text-gray-600">Loading...</div>;
  }

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Set Your Job Preferences</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Preferred Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Salary Expectation</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Preferred Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>

            {success && <p className="text-green-600 mt-4">Preferences saved successfully!</p>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
