// src/app/companies/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';


export default async function CompaniesListPage() {
  const { data: companies, error } = await supabase
    .from('companies_db')
    .select('slug, company_name, logo_url, overall_rating')
    .order('company_name', { ascending: true });

  if (error || !companies) {
    return <div className="p-6 text-center text-red-600">Failed to load companies.</div>;
  }

  return (
    <>
      <Hero />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Companies</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="block border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 mb-3">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={`${company.company_name} logo`}
                    width={48}
                    height={48}
                    className="rounded-md object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-md" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {company.company_name}
                  </h2>
                  {company.overall_rating && (
                    <div className="text-sm text-yellow-600 font-medium">
                      ⭐ {company.overall_rating.toFixed(1)} / 5
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-blue-600 hover:underline">View Company →</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
