// src/types/index.ts - Match your exact Supabase structure
export interface Job {
  JobID: string;
  JobTitle: string;
  LongDescription: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  Industry: string;                    // String field from your data
  JobType: string;
  SubmissionDate: number | null;       // Float from your data
  ExpirationDate: number | null;       // Float from your data
  CompanyLogo: number | null;          // Float from your data
  "Related Submissions": number | null; // Float from your data
  PostedDate: string;                  // String from your data
  is_remote: boolean;
  Interval: string;
  min_amount: number;                  // Float from your data
  max_amount: number;                  // Float from your data
  currency: string;
  source: string;
  formatted_salary: string;
  job_url: string;
  job_url_direct: string;
  CreatedTime: string;                 // Date as string
  is_duplicate: number | null;         // Float from your data
  slug: string;
}

// Company interface stays the same if your company structure matches
export interface Company {
  id: string;
  name: string;
  short_name: string;
  website: string;
  headquarters: string;
  industry: string;
  size: string;
  type: string;
  year_founded: number;
  revenue: string;
  description: string;
  mission: string;
  company_logo: string;
  cover_photo?: number;
  overall_rating: number;
  career_rating: number;
  ceo_name: string;
  ceo_photo?: number;
  created_at: string;
  updated_at?: string;
  ceo_title: string;
  slug: string;
}