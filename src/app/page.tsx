// src/app/page.tsx — Server Component (PSI-optimized, cookies() async-safe)
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { MapPin, DollarSign, ArrowRight, Plus, Bell, Building2, Search } from 'lucide-react';
import Footer from '@/components/Footer';
import NewsletterSignup from '@/components/NewsletterSignup';

// --- Supabase server client (fixed cookie types) ---
async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

function getJobBadge(job: any) {
  const company = job.Company?.toLowerCase() || '';
  const title = job.JobTitle?.toLowerCase() || '';
  if (company.includes('government') || company.includes('federal') || title.includes('government') || title.includes('federal')) {
    return { text: 'GOVT', color: 'bg-gray-600' };
  }
  if (job.is_remote) return { text: 'REMOTE', color: 'bg-green-600' };
  return null;
}

async function getFeaturedJobs() {
  const supabase = await getServerSupabase(); // <-- FIX: await the client

  const { data: govJobs } = await supabase
    .from('job_listings_db')
    .select(`*, company_db!inner(company_logo, name)`)
    .or('Company.ilike.%government%,Company.ilike.%federal%,Company.ilike.%state%,JobTitle.ilike.%government%,JobTitle.ilike.%federal%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  const { data: remoteJobs } = await supabase
    .from('job_listings_db')
    .select(`*, company_db!inner(company_logo, name)`)
    .eq('is_remote', true)
    .not('Company', 'ilike', '%government%')
    .not('Company', 'ilike', '%federal%')
    .not('JobTitle', 'ilike', '%government%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  const { data: regularJobs } = await supabase
    .from('job_listings_db')
    .select(`*, company_db!inner(company_logo, name)`)
    .eq('is_remote', false)
    .not('Company', 'ilike', '%government%')
    .not('Company', 'ilike', '%federal%')
    .not('JobTitle', 'ilike', '%government%')
    .order('PostedDate', { ascending: false })
    .limit(1);

  return ([...(regularJobs || []), ...(remoteJobs || []), ...(govJobs || [])] as any[]).slice(0, 3);
}

export default async function HomePage() {
  const featuredJobs = await getFeaturedJobs();

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden flex items-center py-24 md:py-36 min-h-[70vh] md:min-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-slate-900/50" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-blue-400/20" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 lg:gap-10">
            {/* Left */}
            <div className="md:col-span-6 lg:col-span-7 order-2 md:order-1 mt-10 md:mt-0">
              <div className="lg:me-8">
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Find Your{' '}
                  <span className="relative inline-block">
                    <span className="absolute inset-0 -skew-y-6 bg-blue-600 rounded-sm" aria-hidden />
                    <span className="relative px-2 text-white">$100k Job</span>
                  </span>
                  <br /> at Leading Companies.
                </h1>

                <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Discover exclusive opportunities at top companies. Join thousands of professionals who've found their dream careers with salaries starting at $100K+.
                </p>

                {/* Search card (pure form, no client JS) */}
                <div className="mt-6 bg-white border-0 shadow-sm rounded-xl p-4">
                  <form action="/jobs" method="GET" className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="q"
                        placeholder="Job title, company, or keyword..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div className="relative lg:w-64">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="location"
                        placeholder="Location or 'Remote'"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center lg:w-auto"
                    >
                      <Search className="w-6 h-6 mr-2" />
                      Search Jobs
                    </button>
                  </form>
                </div>

                <p className="mt-3 text-slate-300">
                  <span className="text-white font-medium">Popular Searches:</span> Designer, Developer, Web, iOS, PHP Senior Engineer
                </p>
              </div>
            </div>

            {/* Right visuals (hidden on mobile) */}
            <div className="hidden md:block md:col-span-6 lg:col-span-5 order-1 md:order-2 [content-visibility:auto]">
              <div className="relative">
                <div className="relative flex justify-end">
                  <div className="rounded-xl shadow-sm overflow-hidden lg:w-[400px] w-[280px]">
                    <Image
                      src="/img/2.jpg"
                      alt="Modern interview"
                      width={800}
                      height={1000}
                      className="h-auto w-full object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBYWV3Yah7x2xy05pCrsZpTSHmEQB4/9k="
                      sizes="(max-width: 1024px) 280px, 400px"
                    />
                  </div>

                  {/* Floating avatar card */}
                  <div className="absolute lg:bottom-20 -bottom-24 xl:-right-20 lg:-right-10 right-2 p-4 rounded-lg shadow-md bg-white w-60 z-10">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">More $100k jobs!</h5>
                    <ul className="relative flex items-center">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <li key={idx} className="-ml-3 first:ml-0">
                          {/* Lightweight SVG avatars (no network hit) */}
                          <span className="inline-block size-10 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <svg viewBox="0 0 40 40" className="h-full w-full">
                              <circle cx="20" cy="20" r="20" fill="currentColor" className="text-gray-200" />
                              <circle cx="20" cy="15" r="6" fill="#bbb" />
                              <rect x="6" y="23" width="28" height="12" rx="6" fill="#ccc" />
                            </svg>
                          </span>
                        </li>
                      ))}
                      <li className="-ml-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-600 text-white border-4 border-white shadow-md">
                          <Plus className="size-4" />
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Lower-left image + bell chip */}
                <div className="absolute -bottom-16 left-0 md:-left-5">
                  <div className="rounded-xl border-8 border-white overflow-hidden lg:w-[280px] w-[200px] shadow-sm">
                    <Image
                      src="/img/1.jpg"
                      alt="Interview"
                      width={560}
                      height={700}
                      className="h-auto w-full object-cover"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBYWV3Yah7x2xy05pCrsZpTSHmEQB4/9k="
                      sizes="(max-width: 1024px) 200px, 280px"
                    />
                  </div>

                  <div className="absolute -top-6 left-2 md:-left-10 bg-white rounded-lg shadow-md px-4 py-3 flex items-center w-max">
                    <Bell className="text-amber-500 size-6" />
                    <p className="text-base font-semibold text-gray-900 ml-2">Job Alert!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs?.length ? (
        <section className="bg-white [content-visibility:auto]">
          <div className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 mx-auto">
            <div className="relative p-6 md:p-16">
              <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center">
                {/* Jobs Column */}
                <div className="mb-10 lg:mb-0 lg:col-span-6 lg:col-start-7 lg:order-2">
                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">Featured Jobs</h2>
                  <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                    Premium jobs, hand picked for you!
                  </p>

                  <div className="grid gap-5">
                    {featuredJobs.map((job: any) => {
                      const badge = getJobBadge(job);
                      const logo = job.company_db?.company_logo || null;
                      return (
                        <div
                          key={job.JobID}
                          className="relative bg-white border border-gray-200 rounded-xl p-5 md:p-6 pr-24 md:pr-28 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
                        >
                          {badge && (
                            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] md:text-xs font-bold text-white rounded ${badge.color}`}>
                              {badge.text}
                            </span>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Company Logo */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {logo ? (
                                <Image
                                  src={logo}
                                  alt={`${job.Company} logo`}
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-gray-400" />
                              )}
                            </div>

                            {/* Job Details */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 pr-10 md:pr-14">
                                {job.JobTitle}
                              </h3>
                              <div className="text-gray-500 text-sm mb-2">{job.Company}</div>
                              <div className="flex items-center text-gray-600 mb-3">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="text-sm truncate">{job.Location}</span>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                {job.formatted_salary && (
                                  <div className="flex items-center text-green-600">
                                    <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span className="text-sm font-medium">{job.formatted_salary}</span>
                                  </div>
                                )}
                                <Link
                                  href={`/jobs/${job.slug}`}
                                  className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium inline-flex items-center"
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors transform hover:scale-[1.02] shadow-lg"
                    >
                      View More Jobs
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>

                {/* Featured Image Column (hidden on mobile, visible lg+) */}
                <div className="hidden lg:col-span-6 lg:block">
                  <div className="relative">
                    <Image
                      className="shadow-xl rounded-2xl object-cover w-full h-[360px] sm:h-[480px] lg:h-[640px]"
                      src="/img/featured-image.jpg"
                      alt="Professional workspace"
                      width={1280}
                      height={960}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBYWV3Yah7x2xy05pCrsZpTSHmEQB4/9k="
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 grid grid-cols-12 size-full pointer-events-none">
                <div className="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <NewsletterSignup />
      <Footer />
    </div>
  );
}