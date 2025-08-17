// src/lib/data.ts - UPDATED VERSION
import { supabase } from './supabase/client'
import { Company, Job } from '@/types'

export async function loadJobData(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('job_listings_db')
      .select('*, company_id')  // Make sure to include company_id
      .order('PostedDate', { ascending: false })

    if (error) {
      console.error('Error loading jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error loading job data:', error)
    return []
  }
}

export async function loadCompanyData(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('company_db')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading companies:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error loading company data:', error)
    return []
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('job_listings_db')
      .select('*, company_id')  // Include company_id
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error loading job by slug:', error)
    return null
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('company_db')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error loading company by slug:', error)
    return null
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}