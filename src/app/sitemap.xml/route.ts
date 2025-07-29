import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: jobs, error } = await supabase
    .from('jobs_db')
    .select('slug, UpdatedTime')
    .order('UpdatedTime', { ascending: false });

  if (error || !jobs) {
    console.error('❌ Sitemap generation error:', error?.message || 'No jobs found');
    return new Response('Failed to generate sitemap.', { status: 500 });
  }

  const baseUrl = 'https://sixfighires.com';

  const staticUrls = [
    '/',
    '/jobs'
  ];

  const staticXml = staticUrls
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join('\n');

  const jobXml = jobs
    .map((job) => {
      const lastMod = new Date(job.UpdatedTime || new Date()).toISOString();
      return `
    <url>
      <loc>${baseUrl}/jobs/${job.slug}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticXml}
  ${jobXml}
  </urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
