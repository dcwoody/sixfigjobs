// src/lib/newsletter.ts
export interface NewsletterJob {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  ShortDescription: string;
  PostedDate: string;
  is_remote: boolean;
  slug: string;
}

export interface NewsletterStats {
  totalJobs: number;
  newJobs: number;
  avgSalary?: string;
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/newsletter/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export function generateNewsletterSubject(newJobsCount: number, date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${newJobsCount} New Six-Figure Jobs This Week • ${dateStr}`;
}

export function formatJobForNewsletter(job: NewsletterJob): string {
  return `
    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #1e293b;">${job.JobTitle}</h3>
      <p style="margin: 0 0 4px; color: #2563eb; font-weight: 500;">${job.Company}</p>
      <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">${job.Location}${job.is_remote ? ' (Remote)' : ''}</p>
      ${job.formatted_salary ? `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 10px;">${job.formatted_salary}</span>` : ''}
      <p style="margin: 0 0 15px; color: #475569; font-size: 14px; line-height: 1.5;">${job.ShortDescription || ''}</p>
      <a href="https://yourdomain.com/jobs/${job.slug}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Details</a>
    </div>
  `;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}