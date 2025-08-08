// src/app/companies/page.tsx
import React from 'react';
import Link from 'next/link';
import { Search, MapPin, Users, Calendar, Globe, Star } from 'lucide-react';
import { loadCompanyData } from '@/lib/data';
import { Company } from '@/types';

export default async function CompaniesPage() {
  const companies = await loadCompanyData();
  const industries = [...new Set(companies.map(company => company.industry))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Top Companies</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover leading employers offering six-figure opportunities.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{companies.length}</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">{industries.length}</div>
              <div className="text-gray-600">Industries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {companies.filter(c => c.overall_rating && c.overall_rating >= 4.0).length}
              </div>
              <div className="text-gray-600">Highly Rated</div>
            </div>
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {company.company_logo && (
                    <img
                      src={company.company_logo}
                      alt={`${company.name} logo`}
                      className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-2"
                    />
                  )}
                  <div>
                    <Link href={`/companies/${company.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {company.name}
                      </h3>
                    </Link>
                    <p className="text-blue-600 text-sm">{company.industry}</p>
                  </div>
                </div>
                {company.overall_rating && (
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{company.overall_rating}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {company.headquarters}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {company.size}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Founded {company.year_founded}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{company.description}</p>
              
              <div className="flex items-center justify-between">
                <Link href={`/companies/${company.slug}`}>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                    View Profile →
                  </button>
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}