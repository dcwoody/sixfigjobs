// src/app/company/[slug]/page.tsx - FIXED VERSION
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { findCompanyMatch } from '@/lib/dbSync'; // Import the matching function

import Hero from '@/components/NavBar';
import Footer from '@/components/Footer';

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

interface SlimCompany {
    name: string;
    description?: string;
    industry?: string;
    headquarters?: string;
}

// SEO: Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const { data: company } = await supabase
        .from('companies_db')
        .select('name, description, industry, headquarters')
        .eq('slug', slug)
        .single();

    let matchedCompany: SlimCompany | null = company || null;

    if (!matchedCompany) {
        const { data: allCompanies } = await supabase
            .from('companies_db')
            .select('id, name, short_name, description, industry, headquarters, slug, company_logo');

        if (allCompanies) {
            const searchName = slug.replace(/-/g, ' ');
            matchedCompany = findCompanyMatch(searchName, allCompanies) || null;
        }
    }

    if (!matchedCompany) {
        return {
            title: 'Company Not Found | SixFigHires.com',
            description: 'The requested company profile could not be found.'
        };
    }

    const brand = ' | SixFigHires.com';
    const maxTotalLength = 60;
    const rawTitle = `${matchedCompany.name} - Company Profile`;

    const truncatedTitle =
        rawTitle.length + brand.length > maxTotalLength
            ? rawTitle.slice(0, maxTotalLength - brand.length - 1).trim() + '…'
            : rawTitle;

    const finalTitle = `${truncatedTitle}${brand}`;

    return {
        title: finalTitle,
        description: matchedCompany.description || `Learn about ${matchedCompany.name}, a ${matchedCompany.industry || 'leading'} company ${matchedCompany.headquarters ? `based in ${matchedCompany.headquarters}` : ''}. Find jobs and company information.`,
        keywords: `${matchedCompany.name}, company profile, jobs, careers, ${matchedCompany.industry || ''}, ${matchedCompany.headquarters || ''}`,
        openGraph: {
            title: finalTitle,
            description: matchedCompany.description || `Learn about ${matchedCompany.name}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: matchedCompany.description || `Learn about ${matchedCompany.name}`,
        }
    };
}

export default async function CompanyPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const { data: companyData, error } = await supabase
        .from('companies_db')
        .select('*')
        .eq('slug', slug)
        .single();

    let company = companyData;

    if (error || !company) {
        console.log('Exact slug match not found, trying fuzzy matching...');

        const { data: allCompanies } = await supabase
            .from('companies_db')
            .select('*');

        if (allCompanies && allCompanies.length > 0) {
            const searchName = slug.replace(/-/g, ' ');
            const matchedCompany = findCompanyMatch(searchName, allCompanies);

            if (matchedCompany) {
                company = matchedCompany;
                console.log(`Fuzzy match found: ${company.name}`);
            }
        }
    }

    if (!company) {
        console.log('No company match found, checking if jobs exist for this company...');

        const searchName = slug.replace(/-/g, ' ');
        const { data: jobsForCompany } = await supabase
            .from('job_listings_db')
            .select('Company, JobID, JobTitle, Location, formatted_salary, JobType, ShortDescription, slug')
            .ilike('Company', `%${searchName}%`)
            .limit(10);

        if (jobsForCompany && jobsForCompany.length > 0) {
            const companyName = jobsForCompany[0].Company;
            company = {
                id: `placeholder-${slug}`,
                name: companyName,
                short_name: companyName,
                slug: slug,
                description: `${companyName} is actively hiring for multiple positions. Explore their current job openings below.`,
                website: null,
                headquarters: null,
                industry: null,
                size: null,
                type: null,
                year_founded: null,
                revenue: null,
                mission: null,
                company_logo: null,
                cover_photo: null,
                overall_rating: null,
                career_rating: null,
                ceo_name: null,
                ceo_photo: null,
                ceo_title: null,
                created_at: new Date().toISOString(),
                updated_at: null
            };

            console.log(`Created placeholder company for: ${companyName}`);
        }
    }

    if (!company) {
        console.error('Company not found:', slug);
        notFound();
    }

    // Get jobs for this company (enhanced search)
    const { data: companyJobs } = await supabase
        .from('job_listings_db')
        .select('JobID, CompanyLogo, JobTitle, Company, Location, formatted_salary, JobType, ShortDescription, slug')
        .or(`Company.ilike.%${company.name}%,Company.ilike.%${company.short_name || ''}%`)
        .limit(10);

    // Get related companies (same industry) - only if we have a real company
    let relatedCompanies = null;
    if (company.id && !company.id.startsWith('placeholder-')) {
        const { data } = await supabase
            .from('companies_db')
            .select('id, name, short_name, company_logo, industry, slug')
            .neq('id', company.id)
            .eq('industry', company.industry || '')
            .limit(6);
        relatedCompanies = data;
    }

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
        "address": company.headquarters ? {
            "@type": "PostalAddress",
            "addressLocality": company.headquarters
        } : undefined,
        "aggregateRating": company.overall_rating ? {
            "@type": "AggregateRating",
            "ratingValue": company.overall_rating,
            "bestRating": "5",
            "ratingCount": "100"
        } : undefined
    };

    return (
        <>
            <Hero />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm text-gray-600">
                            <li>
                                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link href="/company" className="hover:text-blue-600 transition-colors">Companies</Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-gray-900 font-medium">{company.name}</span>
                            </li>
                        </ol>
                    </nav>

                    {/* Company Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">

                        {/* Cover Photo or Gradient */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                        <div className="p-8">
                            <div className="flex items-start gap-6 mb-6">
                                {/* Company Logo */}
                                {company.company_logo ? (
                                    <Image
                                        src={company.company_logo}
                                        alt={`${company.name} logo`}
                                        width={100}
                                        height={100}
                                        className="w-20 h-20 object-contain rounded-xl border border-gray-200 p-2 bg-white -mt-10"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center -mt-10 border-4 border-white">
                                        <span className="text-white font-bold text-2xl">
                                            {company.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>

                                    {company.industry && (
                                        <p className="text-lg text-gray-600 mb-2">{company.industry}</p>
                                    )}

                                    {company.headquarters && (
                                        <p className="text-gray-500 mb-3">{company.headquarters}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {company.size && (
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                {company.size}
                                            </span>
                                        )}
                                        {company.year_founded && (
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Founded {company.year_founded}
                                            </span>
                                        )}
                                        {company.website && (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-blue-600 hover:text-blue-700"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {company.description && (
                                <p className="text-gray-700 leading-relaxed">{company.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Company Overview */}
                            {(company.mission || company.description) && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">About {company.name}</h2>

                                    {company.mission && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900">Mission</h3>
                                            <p className="text-gray-700 leading-relaxed">{company.mission}</p>
                                        </div>
                                    )}

                                    {company.description && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900">Overview</h3>
                                            <p className="text-gray-700 leading-relaxed">{company.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Jobs Section */}
                            {companyJobs && companyJobs.length > 0 && (
                                <section id="jobs">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                            Open Positions at {company.name} ({companyJobs.length})
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {companyJobs.map((job) => (
                                                <div key={job.JobID} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex items-start gap-4">
                                                        {job.CompanyLogo && (
                                                            <Image
                                                                src={job.CompanyLogo}
                                                                alt={`${job.Company} logo`}
                                                                width={40}
                                                                height={40}
                                                                className="w-10 h-10 object-contain rounded border border-gray-200 p-1 bg-white flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                                <Link href={`/jobs/${job.slug}`} className="hover:text-blue-600">
                                                                    {job.JobTitle}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mb-2">{job.Location}</p>
                                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.ShortDescription}</p>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-green-600 font-semibold">
                                                                    {job.formatted_salary || 'Competitive salary'}
                                                                </span>
                                                                <Link
                                                                    href={`/jobs/${job.slug}`}
                                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                                >
                                                                    View Details →
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            {/* Company Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Details</h3>
                                <div className="space-y-4">
                                    {company.industry && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Industry</dt>
                                            <dd className="text-sm font-medium text-gray-900">{company.industry}</dd>
                                        </div>
                                    )}
                                    {company.size && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Company Size</dt>
                                            <dd className="text-sm font-medium text-gray-900">{company.size}</dd>
                                        </div>
                                    )}
                                    {company.headquarters && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Headquarters</dt>
                                            <dd className="text-sm font-medium text-gray-900">{company.headquarters}</dd>
                                        </div>
                                    )}
                                    {company.year_founded && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Founded</dt>
                                            <dd className="text-sm font-medium text-gray-900">{company.year_founded}</dd>
                                        </div>
                                    )}
                                    {company.revenue && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Revenue</dt>
                                            <dd className="text-sm font-medium text-gray-900">{company.revenue}</dd>
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
                                                    : 'text-gray-300'
                                                    }`}
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

                            {/* Related Companies */}
                            {relatedCompanies && relatedCompanies.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Related Companies</h3>
                                    <div className="space-y-3">
                                        {relatedCompanies.map((relatedCompany) => (
                                            <Link
                                                key={relatedCompany.id}
                                                href={`/company/${relatedCompany.slug}`}
                                                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                {relatedCompany.company_logo ? (
                                                    <Image
                                                        src={relatedCompany.company_logo}
                                                        alt={`${relatedCompany.name} logo`}
                                                        width={32}
                                                        height={32}
                                                        className="w-8 h-8 object-contain rounded border border-gray-200 p-1 bg-white mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-3">
                                                        <span className="text-white text-xs font-bold">
                                                            {relatedCompany.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {relatedCompany.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {relatedCompany.industry}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Leadership */}
                            {(company.ceo_name || company.ceo_title) && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Leadership</h3>
                                    <div className="flex items-center">
                                        {company.ceo_photo ? (
                                            <Image
                                                src={company.ceo_photo}
                                                alt={company.ceo_name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-full object-cover mr-3"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-white font-bold">
                                                    {company.ceo_name?.charAt(0).toUpperCase() || 'C'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {company.ceo_name || 'Leadership Team'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {company.ceo_title || 'CEO'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}