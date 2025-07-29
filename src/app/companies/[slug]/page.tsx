// src/app/companies/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const { data: company } = await supabase
        .from('companies_db')
        .select('company_name, description')
        .eq('slug', slug)
        .single();

    if (!company) {
        return {
            title: 'Company Not Found | SixFigHires.com',
            description: 'The requested company profile could not be found.'
        };
    }

    return {
        title: `${company.company_name} | SixFigHires.com`,
        description: company.description || `Learn more about ${company.company_name}.`
    };
}

export default async function CompanyPage({ params }: PageProps) {
    const { slug } = await params;

    const { data: company, error } = await supabase
        .from('companies_db')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !company) {
        notFound();
    }

    return (
        <>
            <Hero />
            <main className="max-w-5xl mx-auto p-6">
                <div className="mb-8 border-b pb-6">
                    <div className="flex items-center gap-4">
                        {company.logo_url && (
                            <Image
                                src={company.logo_url}
                                alt={`${company.company_name} logo`}
                                width={64}
                                height={64}
                                className="object-contain border rounded-lg"
                            />
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">
                            {company.company_name}
                        </h1>
                    </div>
                    {company.website && (
                        <Link
                            href={company.website}
                            className="text-blue-600 hover:underline text-sm mt-2 block"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit Website
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <section className="md:col-span-2 space-y-6">
                        {company.description && (
                            <div>
                                <h2 className="text-xl font-semibold mb-2">About</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {company.description}
                                </p>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Company Details</h2>
                            <ul className="text-gray-700 space-y-2">
                                {company.headquarters && <li><strong>Headquarters:</strong> {company.headquarters}</li>}
                                {company.industry && <li><strong>Industry:</strong> {company.industry}</li>}
                                {company.ceo && <li><strong>CEO:</strong> {company.ceo}</li>}
                            </ul>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Company Rating</h3>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-2">Glassdoor Rating</div>
                                <div className="flex items-center justify-center mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-5 h-5 ${company.overall_rating && star <= Math.round(company.overall_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 22 20"
                                        >
                                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                        </svg>
                                    ))}
                                </div>
                                {company.overall_rating ? (
                                    <>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">{company.overall_rating.toFixed(1)}</div>
                                        <div className="text-sm text-gray-600">out of 5 stars</div>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">No rating available</div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </>
    );
}
