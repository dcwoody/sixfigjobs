// src/app/admin/layout.tsx
import Link from 'next/link';
import { Mail, Users, Settings, BarChart3 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          
          <nav className="mt-6">
            <div className="px-6 py-2">
              <Link 
                href="/admin"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </div>
            
            <div className="px-6 py-2">
              <Link 
                href="/admin/newsletter"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Mail className="h-5 w-5 mr-3" />
                Newsletter
              </Link>
            </div>
            
            <div className="px-6 py-2">
              <Link 
                href="/admin/users"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Users className="h-5 w-5 mr-3" />
                Users
              </Link>
            </div>
            
            <div className="px-6 py-2">
              <Link 
                href="/admin/settings"
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}