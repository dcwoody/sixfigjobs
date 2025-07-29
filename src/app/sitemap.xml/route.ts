// /src/app/sitemap.xml/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: jobs, error } = await supabase
    .from('jobs_db')
    .select('slug, UpdatedTime')
    .order('UpdatedTime', { ascending: false });

  if (error || !jobs) {
    console.error('❌ Sitemap error:', error?.message || 'No jobs returned');
    return new Response('Error generating sitemap', { status: 500 });
  }

  const baseUrl = 'https://sixfighires.com';

  const urls = jobs.map((job) => {
    return `
      <url>
        <loc>${baseUrl}/jobs/${job.slug}</loc>
        <lastmod>${new Date(job.UpdatedTime || new Date()).toISOString()}</lastmod>
      </url>`;
  });

  const staticUrls = `
    <url><loc>${baseUrl}</loc></url>
    <url><loc>${baseUrl}/jobs</loc></url>
  `;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
    ${urls.join('\n')}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
