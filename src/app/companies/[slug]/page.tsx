// src/app/companies/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;
  const companyName = decodeURIComponent(slug).replace(/-/g, ' ');

  const { data: company, error } = await supabase
    .from('companies_db')
    .select('*')
    .ilike('company_name', companyName)
    .single();

  if (error || !company) {
    console.error('Company not found or Supabase error:', error);
    notFound();
  }

  return (
    <>
      <Hero />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <div className="flex items-center gap-6">
            {company.logo && (
              <Image
                src={company.logo}
                alt={`${company.company_name} logo`}
                width={64}
                height={64}
                className="w-16 h-16 object-contain rounded border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {company.company_name}
              </h1>
              {company.website && (
                <Link
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </Link>
              )}
            </div>
          </div>

          {company.description && (
            <p className="mt-6 text-gray-700 leading-relaxed">
              {company.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {company.ceo_name && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-sm text-gray-500 mb-1">CEO</div>
              <div className="text-lg font-semibold text-gray-900">{company.ceo_name}</div>
            </div>
          )}

          {company.headquarters && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-sm text-gray-500 mb-1">Headquarters</div>
              <div className="text-lg font-semibold text-gray-900">{company.headquarters}</div>
            </div>
          )}

          {company.industry && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-sm text-gray-500 mb-1">Industry</div>
              <div className="text-lg font-semibold text-gray-900">{company.industry}</div>
            </div>
          )}

          {company.overall_rating !== undefined && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-sm text-gray-500 mb-1">Glassdoor Rating</div>
              <div className="text-lg font-semibold text-yellow-500">
                {company.overall_rating.toFixed(1)} / 5
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
