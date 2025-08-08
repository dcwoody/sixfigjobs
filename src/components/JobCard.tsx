// src/components/JobCard.tsx
import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Heart, ExternalLink } from 'lucide-react';
import { Job } from '@/types';
import { formatDate } from '@/lib/data';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link href={`/jobs/${job.slug}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer">
                  {job.JobTitle}
                </h3>
              </Link>
              <Link href={`/companies/${job.Company.toLowerCase().replace(/\s+/g, '-')}`}>
                <p className="text-blue-600 font-medium cursor-pointer hover:underline">
                  {job.Company}
                </p>
              </Link>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.Location}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {job.formatted_salary}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(job.PostedDate)}
            </div>
            {job.is_remote && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Remote
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">{job.ShortDescription}</p>
          
          <div className="flex items-center space-x-3">
            <Link href={`/jobs/${job.slug}`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </Link>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
            >
              Apply Now <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}