// src/app/company/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

import Hero from '@/components/Hero';
import Footer from '@/components/Footer';


// Create URL-friendly slug from company name
function createSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Title case utility
function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word =>
            word.length > 2
                ? word.charAt(0).toUpperCase() + word.slice(1)
                : word
        )
        .join(' ');
}

// Helper function for time formatting
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// SEO: Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const { data: company } = await supabase
        .from('companies_db')
        .select('name, description, industry, headquarters')
        .eq('id', slug)
        .or(`short_name.ilike.%${slug}%,name.ilike.%${decodeURIComponent(slug).replace(/-/g, ' ')}%`)
        .single();

    if (!company) {
        return {
            title: 'Company Not Found | SixFigHires.com',
            description: 'The requested company profile could not be found.'
        };
    }

    const brand = ' | SixFigHires.com';
    const maxTotalLength = 60;
    const rawTitle = `${company.name} - Company Profile`;

    const truncatedTitle =
        rawTitle.length + brand.length > maxTotalLength
            ? rawTitle.slice(0, maxTotalLength - brand.length - 1).trim() + '…'
            : rawTitle;

    const finalTitle = `${truncatedTitle}${brand}`;

    return {
        title: finalTitle,
        description: company.description || `Learn about ${company.name}, a ${company.industry || 'leading'} company ${company.headquarters ? `based in ${company.headquarters}` : ''}. Find jobs and company information.`,
        keywords: `${company.name}, company profile, jobs, careers, ${company.industry || ''}, ${company.headquarters || ''}`,
        openGraph: {
            title: finalTitle,
            description: company.description || `Learn about ${company.name}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: company.description || `Learn about ${company.name}`,
        }
    };
}

export default async function CompanyPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Try to find company by ID first, then by slug-like matching
    const { data: company, error } = await supabase
        .from('companies_db')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !company) {
        console.error('Company not found or Supabase error:', error);
        notFound();
    }

    // Get jobs for this company
    const { data: companyJobs } = await supabase
        .from('jobs_db')
        .select('JobID, CompanyLogo, JobTitle, Company, Location, formatted_salary, JobType, ShortDescription, slug')
        .ilike('Company', `%${company.name}%`)
        .limit(10);

    // Get related companies (same industry)
    const { data: relatedCompanies } = await supabase
        .from('companies_db')
        .select('id, name, short_name, company_logo, industry')
        .neq('id', company.id)
        .eq('industry', company.industry || '')
        .limit(6);

    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Organization",
        "name": company.name,
        "description": company.description,
        "url": company.website,
        "logo": company.company_logo,
        "foundingDate": company.year_founded?.toString(),
        "numberOfEmployees": company.size,
        "industry": company.industry,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": company.headquarters
        },
        "aggregateRating": company.overall_rating ? {
            "@type": "AggregateRating",
            "ratingValue": company.overall_rating,
            "ratingCount": 100
        } : undefined
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />

            <Hero />
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm text-gray-600">
                            <li>
                                <Link href="/" className="hover:text-blue-600 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link href="/company" className="hover:text-blue-600 transition-colors">
                                    Companies
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-gray-900 font-medium truncate max-w-xs">
                                    {company.name}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        {/* Cover Photo */}
                        {company.cover_photo && (
                            <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-700 relative">
                                <Image
                                    src={company.cover_photo}
                                    alt={`${company.name} cover`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-6 mb-6">
                                        {company.company_logo && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={company.company_logo}
                                                    alt={`${company.name} logo`}
                                                    width={96}
                                                    height={96}
                                                    className="w-24 h-24 object-contain rounded-xl border border-gray-200 p-2 bg-white shadow-sm"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.name}</h1>
                                            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                                                {company.industry && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        {company.industry}
                                                    </div>
                                                )}
                                                {company.headquarters && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {company.headquarters}
                                                    </div>
                                                )}
                                                {company.size && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        {company.size}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                {company.website && (
                                                    <a
                                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm"
                                                    >
                                                        Visit Website
                                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                )}
                                                {companyJobs && companyJobs.length > 0 && (
                                                    <a
                                                        href="#jobs"
                                                        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm"
                                                    >
                                                        View Jobs ({companyJobs.length})
                                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Company Overview */}
                            {company.description && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h3>
                                    <div className="prose prose-gray max-w-none">
                                        {company.description.split('\n').map((paragraph: string, idx: number) => (
                                            <p key={idx} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                                                {paragraph.trim()}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mission Statement */}
                            {company.mission && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Mission Statement</h3>
                                    <div className="prose prose-gray max-w-none">
                                        {company.mission.split('\n').map((paragraph: string, idx: number) => (
                                            <p key={idx} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                                                {paragraph.trim()}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CEO Information */}
                            {company.ceo_name && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Leadership</h3>
                                    <div className="flex items-center gap-4">
                                        {company.ceo_photo && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={company.ceo_photo}
                                                    alt={`${company.ceo_name} photo`}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 object-cover rounded-full border border-gray-200"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{company.ceo_name}</h4>
                                            {company.ceo_title && (
                                                <p className="text-gray-600">{company.ceo_title}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            {/* Company Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Details</h3>
                                <div className="space-y-4">

                                    {company.year_founded && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">Founded</span>
                                            <span className="text-sm font-semibold text-gray-900">{company.year_founded}</span>
                                        </div>
                                    )}

                                    {company.type && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">Type</span>
                                            <span className="text-sm font-semibold text-blue-600">{company.type}</span>
                                        </div>
                                    )}

                                    {company.revenue && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">Revenue</span>
                                            <span className="text-sm font-semibold text-green-600">{company.revenue}</span>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Company Rating */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Rating</h3>

                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-2">Glassdoor Rating</div>

                                    {/* Star Rating */}
                                    <div className="flex items-center justify-center mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-5 h-5 ${company.overall_rating && star <= Math.round(company.overall_rating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 22 20"
                                            >
                                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                            </svg>
                                        ))}
                                    </div>

                                    {company.overall_rating !== undefined && company.overall_rating !== null ? (
                                        <>
                                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                                {company.overall_rating.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">out of 5 stars</div>

                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                                                <div className="text-xs text-gray-500">
                                                    Based on employee reviews
                                                </div>

                                                {company.updated_at && (
                                                    <div className="text-xs text-gray-400">
                                                        Updated {formatTimeAgo(company.updated_at)}
                                                    </div>
                                                )}

                                                {company.career_rating && (
                                                    <div className="text-xs text-gray-600 mt-2">
                                                        Career Opportunities: {company.career_rating.toFixed(1)}/5
                                                    </div>
                                                )}

                                                <a
                                                    href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(company.name)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
                                                >
                                                    View on Glassdoor
                                                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-gray-500 text-sm italic mb-1">Not yet rated</div>
                                            <div className="text-sm text-gray-400">No available Glassdoor rating</div>

                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500 mb-2">
                                                    Want to know more about this company?
                                                </div>
                                                <a
                                                    href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(company.name)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Search on Glassdoor →
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs Section */}
                    {companyJobs && companyJobs.length > 0 && (
                        <section id="jobs" className="mt-16">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                    Open Positions at {company.name} ({companyJobs.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {companyJobs.map((job) => (
                                        <div key={job.JobID} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start gap-4">
                                                {job.CompanyLogo && (
                                                    <div className="flex-shrink-0">
                                                        <Image
                                                            src={job.CompanyLogo}
                                                            alt={`${job.Company} logo`}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 object-contain rounded-lg border border-gray-200 p-1"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                        {toTitleCase(job.JobTitle)}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {job.Location}
                                                    </div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium text-green-700">
                                                            {job.formatted_salary || 'Salary not disclosed'}
                                                        </span>
                                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                            {job.JobType}
                                                        </span>
                                                    </div>
                                                    {job.ShortDescription && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                            {job.ShortDescription}
                                                        </p>
                                                    )}
                                                    <Link
                                                        href={`/jobs/${job.slug}`}
                                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        View Job Details
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* People Also Viewed Section */}
                    {relatedCompanies && relatedCompanies.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">People Also Viewed</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedCompanies.map((relatedCompany) => (
                                    <div key={relatedCompany.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="text-center">
                                            {relatedCompany.company_logo && (
                                                <div className="flex justify-center mb-4">
                                                    <Image
                                                        src={relatedCompany.company_logo}
                                                        alt={`${relatedCompany.name} logo`}
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 object-contain rounded-lg border border-gray-200 p-2"
                                                    />
                                                </div>
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {relatedCompany.name}
                                            </h3>
                                            {relatedCompany.industry && (
                                                <p className="text-sm text-gray-600 mb-4">{relatedCompany.industry}</p>
                                            )}
                                            <Link
                                                href={`/company/${createSlug(relatedCompany.name)}`}
                                                className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                            >
                                                View Company
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
