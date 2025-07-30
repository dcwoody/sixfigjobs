'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export default function JobSubmissionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    JobTitle: '',
    Company: '',
    Location: '',
    JobType: 'Full-Time',
    Description: '',
    SalaryMin: '',
    SalaryMax: '',
    ContactEmail: '',
    is_remote: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    if (target.type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        [target.name]: (target as HTMLInputElement).checked,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [target.name]: target.value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!session?.user?.id) {
      setError('User not found. Please log in again.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('jobs_db').insert([
      {
        JobTitle: form.JobTitle,
        Company: form.Company,
        Location: form.Location,
        JobType: form.JobType,
        Description: form.Description,
        SalaryMin: form.SalaryMin ? Number(form.SalaryMin) : null,
        SalaryMax: form.SalaryMax ? Number(form.SalaryMax) : null,
        ContactEmail: form.ContactEmail,
        is_remote: form.is_remote,
        source: 'manual',
        approved: false,
        user_id: session.user.id,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      router.push('/thank-you');
    }

    setSubmitting(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!session) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-4">Submit a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="JobTitle"
          placeholder="Job Title"
          required
          value={form.JobTitle}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="Company"
          placeholder="Company Name"
          required
          value={form.Company}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="Location"
          placeholder="Location"
          required
          value={form.Location}
          onChange={handleChange}
          className="input"
        />
        <select name="JobType" value={form.JobType} onChange={handleChange} className="input">
          <option>Full-Time</option>
          <option>Part-Time</option>
          <option>Contract</option>
          <option>Temporary</option>
          <option>Internship</option>
        </select>
        <label className="block">
          <input
            type="checkbox"
            name="is_remote"
            checked={form.is_remote}
            onChange={handleChange}
            className="mr-2"
          />
          Remote Position?
        </label>
        <textarea
          name="Description"
          placeholder="Job Description"
          required
          value={form.Description}
          onChange={handleChange}
          className="input h-32"
        />
        <input
          type="number"
          name="SalaryMin"
          placeholder="Minimum Salary"
          value={form.SalaryMin}
          onChange={handleChange}
          className="input"
        />
        <input
          type="number"
          name="SalaryMax"
          placeholder="Maximum Salary"
          value={form.SalaryMax}
          onChange={handleChange}
          className="input"
        />
        <input
          type="email"
          name="ContactEmail"
          placeholder="Contact Email"
          required
          value={form.ContactEmail}
          onChange={handleChange}
          className="input"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting ? 'Submitting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
