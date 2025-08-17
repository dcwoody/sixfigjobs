// src/components/SaveJobButton.tsx - ORIGINAL WORKING VERSION
'use client';

import { useState } from 'react';
import { Heart, Bookmark, Check, Loader2 } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';

interface SaveJobButtonProps {
  jobId: string;
  variant?: 'heart' | 'bookmark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function SaveJobButton({ 
  jobId, 
  variant = 'heart', 
  size = 'md', 
  showText = false,
  className = ''
}: SaveJobButtonProps) {
  const { isJobSaved, saveJob, unsaveJob, user } = useSavedJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isSaved = isJobSaved(jobId);

  const handleClick = async () => {
    if (!user) {
      setFeedback('Please sign in to save jobs');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    setIsLoading(true);
    
    try {
      let success = false;
      if (isSaved) {
        success = await unsaveJob(jobId);
        if (success) {
          setFeedback('Job removed from saved');
        }
      } else {
        success = await saveJob(jobId);
        if (success) {
          setFeedback('Job saved!');
        }
      }
      
      if (!success) {
        setFeedback('Something went wrong. Please try again.');
      }
    } catch (error) {
      setFeedback('Something went wrong. Please try again.');
      console.error('Error toggling save job:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'transition-colors duration-200 flex items-center gap-2';
    const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';
    
    if (variant === 'bookmark') {
      return `${baseClasses} ${sizeClasses} rounded-lg border-2 ${
        isSaved 
          ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
          : 'bg-white border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'
      }`;
    }
    
    // Heart variant
    return `${baseClasses} ${sizeClasses} ${
      isSaved 
        ? 'text-red-500 hover:text-red-600' 
        : 'text-gray-400 hover:text-red-500'
    }`;
  };

  const getIcon = () => {
    const iconClasses = getSizeClasses();
    
    if (isLoading) {
      return <Loader2 className={`${iconClasses} animate-spin`} />;
    }

    if (variant === 'bookmark') {
      return isSaved 
        ? <div className="relative"><Bookmark className={`${iconClasses} fill-current`} /><Check className="w-3 h-3 absolute top-0 right-0 text-white" /></div>
        : <Bookmark className={iconClasses} />;
    }
    
    // Heart variant
    return <Heart className={`${iconClasses} ${isSaved ? 'fill-current' : ''}`} />;
  };

  const getText = () => {
    if (!showText) return null;
    
    if (variant === 'bookmark') {
      return isSaved ? 'Saved' : 'Save Job';
    }
    
    return isSaved ? 'Saved' : 'Save';
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${getButtonClasses()} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
      >
        {getIcon()}
        {showText && (
          <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
            {getText()}
          </span>
        )}
      </button>
      
      {feedback && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {feedback}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
}