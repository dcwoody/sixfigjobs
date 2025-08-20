// src/app/api/jobs/route.ts - Optimized Version
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

    if (workType) {
      if (workType === 'remote') {
        countQuery = countQuery.eq('is_remote', true);
        dataQuery = dataQuery.eq('is_remote', true);
      } else if (workType === 'onsite') {
        countQuery = countQuery.eq('is_remote', false);
        dataQuery = dataQuery.eq('is_remote', false);
      }
      // Note: Add hybrid logic if you have a hybrid field
    }

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

    const response = NextResponse.json({
      success: true,
      data: dataResult.data || [],
      total: countResult.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult.count || 0) / limit)
    });

    // Add caching headers
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}