// src/types/index.ts - Updated with company_id
export interface Job {
  JobID: string;
  JobTitle: string;
  LongDescription: string;
  ShortDescription: string;
  Company: string;
  Location: string;
  Industry: string;
  JobType: string;
  SubmissionDate: number | null;
  ExpirationDate: number | null;
  CompanyLogo: number | null;
  "Related Submissions": number | null;
  PostedDate: string;
  is_remote: boolean;
  Interval: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  source: string;
  formatted_salary: string;
  job_url: string;
  job_url_direct: string;
  CreatedTime: string;
  is_duplicate: number | null;
  slug: string;
  company_id?: string | null;  // ADD THIS FIELD
}

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
  wikipedia_url?: string;
  enrichment_status?: string;
  enrichment_date?: string;
  enrichment_fields_added?: string;
}