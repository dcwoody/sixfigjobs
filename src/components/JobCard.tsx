// src/components/JobCard.tsx
import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Building2, Clock, Briefcase } from 'lucide-react';
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
  company?: any; // Add company prop
  showSaveButton?: boolean;
  className?: string;
}

export default function JobCard({ job, company, showSaveButton = true, className = '' }: JobCardProps) {
  // Function to determine badge color based on job type
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full_time':
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'freelance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Row 1: Company logo and name */}
      <div className="flex items-center mb-4">
        {/* Company Logo */}
        {company?.company_logo ? (
          <img
            src={company.company_logo}
            alt={`${company.name} logo`}
            className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-2 bg-white mr-4"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mr-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div>
          <Link 
            href={`/companies/${job.Company.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            {job.Company}
          </Link>
        </div>
      </div>

      {/* Row 2: Job Title and Save Button */}
      <div className="flex items-start justify-between mb-3">
        <Link 
          href={`/jobs/${job.slug}`}
          className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors flex-1 mr-4"
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

      {/* Row 3: Location pin and Posted date with clock */}
      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span>{job.Location}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          <span>Posted {formatDate(job.PostedDate)}</span>
        </div>
      </div>

      {/* Row 4: Badges (Remote, Full-time, etc.) */}
      <div className="flex items-center space-x-2 mb-4">
        {job.is_remote && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            Remote
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(job.JobType)}`}>
          {job.JobType.replace('_', ' ')}
        </span>
        {/* Add more badges here as needed - you can add government, etc. based on your data */}
      </div>

      {/* Row 5: Salary and Apply Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium text-green-600">{job.formatted_salary}</span>
        </div>
        
        <Link 
          href={`/jobs/${job.slug}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Apply
        </Link>
      </div>
    </div>
  );
}