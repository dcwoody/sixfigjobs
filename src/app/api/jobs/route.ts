// src/app/api/jobs/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Enable caching for this route
export const runtime = 'nodejs';
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const location = searchParams.get('location');
  const jobType = searchParams.get('jobType');
  const workType = searchParams.get('workType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50); // Cap at 50
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();

    // Build optimized query - only select needed fields
    const selectFields = `
      JobID,
      JobTitle,
      ShortDescription,
      Company,
      Location,
      formatted_salary,
      slug,
      PostedDate,
      is_remote,
      JobType,
      company_id
    `;

    // Build base queries
    let countQuery = supabase
      .from('job_listings_db')
      .select('JobID', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('job_listings_db')
      .select(selectFields)
      .order('PostedDate', { ascending: false });

    // Apply search filters
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
      countQuery = countQuery.eq('JobType', jobType);
      dataQuery = dataQuery.eq('JobType', jobType);
    }

    // 🔥 FIXED: Work Type filtering
    if (workType) {
      console.log('🔍 Filtering by workType:', workType);
      
      if (workType === 'Remote') {
        countQuery = countQuery.eq('is_remote', true);
        dataQuery = dataQuery.eq('is_remote', true);
      } else if (workType === 'On-site') {
        countQuery = countQuery.eq('is_remote', false);
        dataQuery = dataQuery.eq('is_remote', false);
      } else if (workType === 'Hybrid') {
      countQuery = countQuery.ilike('ShortDescription', '%hybrid%');
      dataQuery = dataQuery.ilike('ShortDescription', '%hybrid%');
      }
    }

    // Add debugging
    console.log('🔍 Filter Debug:', {
      workType,
      location,
      jobType,
      searchQuery: q,
      page,
      limit
    });

    // Execute queries in parallel for better performance
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery.range(offset, offset + limit - 1)
    ]);

    if (countResult.error) {
      console.error('Count query error:', countResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to count jobs' },
        { status: 500 }
      );
    }

    if (dataResult.error) {
      console.error('Data query error:', dataResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // 🔥 FIXED: Use the correct variable names from the query results
    const jobs = dataResult.data || [];
    const totalCount = countResult.count || 0;

    // Add results debugging
    console.log('🔍 Results Debug:', {
      totalResults: totalCount,
      filteredJobs: jobs.length,
      sampleJob: jobs[0] ? {
        title: jobs[0].JobTitle,
        company: jobs[0].Company,
        isRemote: jobs[0].is_remote,
        location: jobs[0].Location
      } : null
    });

    // 🔥 FIXED: Create response with correct structure
    const responseData = NextResponse.json({
      success: true,
      data: jobs,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page: page,
      limit: limit
    });

    // Add caching headers
    responseData.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return responseData;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}