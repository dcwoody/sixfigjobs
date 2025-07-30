// src/components/FeaturedJobs.tsx
import React from 'react';
import { ArrowRight, MapPin, Clock, Building2 } from 'lucide-react';

const FeaturedJobs = () => {
  const jobs = [
    {
      id: 1,
      title: 'Human Services Benefits Programs Coordinator',
      company: 'City of Alexandria',
      location: 'Alexandria, VA',
      salary: '$65k - $75k',
      type: 'Full-time',
      description: 'Supports the City of Alexandria\'s operations, providing administrative support and coordination for benefits programs.',
      posted: 'Posted recently',
      tags: ['Government', 'Benefits', 'Coordination']
    },
    {
      id: 2,  
      title: 'Graphic Designer (Junior)',
      company: 'Creative Agency',
      location: 'Remote',
      salary: '$45k - $55k',
      type: 'Full-time',
      description: 'A Graphics Designer is sought to develop communication products, marketing materials, and visual content.',
      posted: 'Posted recently',
      tags: ['Design', 'Marketing', 'Creative']
    },
    {
      id: 3,
      title: 'Registered Nurse - Neurology',
      company: 'Medical Center',
      location: 'Washington, DC',
      salary: '$80k - $95k', 
      type: 'Part-time/Full-time',
      description: 'A Registered Nurse in Neurology is sought for a part-time, full-time, or per diem position in our specialty unit.',
      posted: 'Posted recently',
      tags: ['Healthcare', 'Nursing', 'Neurology']
    },
    {
      id: 4,
      title: 'Budget Analyst',
      company: 'Financial Services',
      location: 'Arlington, VA',
      salary: '$70k - $85k',
      type: 'Full-time', 
      description: 'Budget analyst responsible for assessing budget impacts, tracking expenditures, and financial planning.',
      posted: 'Posted recently',
      tags: ['Finance', 'Analysis', 'Budgeting']
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {jobs.map((job) => (
        <div 
          key={job.id} 
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 group h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#31C7FF] transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-1">
              <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{job.company}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-1">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{job.location}</span>
            </div>
            <div className="text-[#31C7FF] font-semibold text-sm mb-2">
              {job.salary}
            </div>
          </div>

          {/* Description */}
          <div className="flex-grow mb-4">
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs font-medium bg-[#31C7FF]/10 text-[#31C7FF] rounded-md"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                +{job.tags.length - 2}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 space-y-3">
            <div className="flex items-center text-gray-500 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              <span>{job.posted}</span>
            </div>
            
            <button className="w-full bg-[#31C7FF] hover:bg-[#28B4E6] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center group">
              View Job
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedJobs;