// src/components/JobCard.tsx
import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Building2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/data';
import SaveJobButton from './SaveJobButton';

interface Job {
  JobID: string;
  JobTitle: string;
  Company: string;
  Location: string;
  formatted_salary: string;
  ShortDescription: string;
  PostedDate: string;
  JobType: string;
  is_remote: boolean;
  slug: string;
}

interface JobCardProps {
  job: Job;
  showSaveButton?: boolean;
  className?: string;
}

export default function JobCard({ job, showSaveButton = true, className = '' }: JobCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <Link 
              href={`/jobs/${job.slug}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {job.JobTitle}
            </Link>
            {showSaveButton && (
              <SaveJobButton 
                jobId={job.JobID} 
                variant="heart" 
                size="md"
              />
            )}
          </div>
          <Link 
            href={`/companies/${job.Company.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-blue-600 font-medium hover:underline"
          >
            {job.Company}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{job.Location}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium text-green-600">{job.formatted_salary}</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          <span>{job.JobType.replace('_', ' ')}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{job.ShortDescription}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Posted {formatDate(job.PostedDate)}</span>
          </div>
          {job.is_remote && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              Remote
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showSaveButton && (
            <SaveJobButton 
              jobId={job.JobID} 
              variant="bookmark" 
              size="sm" 
              showText={false}
            />
          )}
          <Link 
            href={`/jobs/${job.slug}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}