// src/app/api/jobs/route.ts - UPDATED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Use server client

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const location = searchParams.get('location');
  const jobType = searchParams.get('jobType');
  const workType = searchParams.get('workType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient(); // Await the server client

    // Build base query for count
    let countQuery = supabase
      .from('job_listings_db')
      .select('*', { count: 'exact', head: true });

    // Build base query for data - EXPLICITLY INCLUDE company_id
    let dataQuery = supabase
      .from('job_listings_db')
      .select(`
        JobID,
        JobTitle,
        LongDescription,
        ShortDescription,
        Company,
        Location,
        Industry,
        JobType,
        SubmissionDate,
        ExpirationDate,
        CompanyLogo,
        "Related Submissions",
        PostedDate,
        is_remote,
        Interval,
        min_amount,
        max_amount,
        currency,
        source,
        formatted_salary,
        job_url,
        job_url_direct,
        CreatedTime,
        is_duplicate,
        slug,
        company_id
      `)
      .order('PostedDate', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters to both queries
    if (q) {
      const searchFilter = `JobTitle.ilike.%${q}%,ShortDescription.ilike.%${q}%,Company.ilike.%${q}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    if (location) {
      if (location.toLowerCase() === 'remote') {
        countQuery = countQuery.eq('is_remote', true);
        dataQuery = dataQuery.eq('is_remote', true);
      } else {
        countQuery = countQuery.ilike('Location', `%${location}%`);
        dataQuery = dataQuery.ilike('Location', `%${location}%`);
      }
    }

    if (jobType) {
      countQuery = countQuery.ilike('JobType', `%${jobType}%`);
      dataQuery = dataQuery.ilike('JobType', `%${jobType}%`);
    }

    if (workType === 'Remote') {
      countQuery = countQuery.eq('is_remote', true);
      dataQuery = dataQuery.eq('is_remote', true);
    } else if (workType === 'On-site') {
      countQuery = countQuery.eq('is_remote', false);
      dataQuery = dataQuery.eq('is_remote', false);
    }

    // Execute both queries
    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    if (error) {
      console.error('Jobs API error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Debug: Log a sample to verify company_id is included
    if (data && data.length > 0) {
      console.log('Sample job data:', {
        JobTitle: data[0].JobTitle,
        Company: data[0].Company,
        company_id: data[0].company_id,
        hasCompanyId: !!data[0].company_id
      });
    }

    return NextResponse.json({
      jobs: data || [],
      totalJobs: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      hasMore: (count || 0) > offset + limit
    });

  } catch (error) {
    console.error('Jobs API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}