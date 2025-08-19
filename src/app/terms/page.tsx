// src/app/terms/page.tsx
import Link from 'next/link';
import { Shield, FileText, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service - SixFigHires',
  description: 'Terms of Service and user agreement for SixFigHires job board platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-amber-800 font-semibold mb-2">Important Notice</h3>
              <p className="text-amber-700 text-sm">
                By accessing and using SixFigHires, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          
          {/* 1. Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") govern your use of the SixFigHires website and services 
              (collectively, the "Service") operated by SixFigHires ("we," "us," or "our").
            </p>
            <p className="text-gray-700">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
              with any part of these terms, then you may not access the Service.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              SixFigHires is a job board platform that connects job seekers with high-paying career 
              opportunities, typically offering salaries of $100,000 or more annually. Our Service includes:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• Job listing browsing and search functionality</li>
              <li>• Company profile information</li>
              <li>• User account creation and management</li>
              <li>• Job application tracking and saved jobs</li>
              <li>• Weekly newsletter with curated job opportunities</li>
              <li>• Career resources and salary information</li>
            </ul>
          </section>

          {/* 3. User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide information that is accurate, 
              complete, and current at all times. You are responsible for safeguarding the password 
              and for all activities that occur under your account.
            </p>
            <p className="text-gray-700 mb-4">
              You must not:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• Use another person's account without permission</li>
              <li>• Create multiple accounts for the same individual</li>
              <li>• Share your account credentials with others</li>
              <li>• Use automated tools to access the Service</li>
            </ul>
          </section>

          {/* 4. Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">
              You may use our Service only for lawful purposes and in accordance with these Terms. 
              You agree not to use the Service:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• To violate any applicable federal, state, local, or international law or regulation</li>
              <li>• To transmit, or procure the sending of, any advertising or promotional material</li>
              <li>• To impersonate or attempt to impersonate the Company, employees, or other users</li>
              <li>• To engage in any other conduct that restricts or inhibits anyone's use of the Service</li>
              <li>• To scrape, harvest, or collect user information without consent</li>
              <li>• To submit false or misleading information</li>
            </ul>
          </section>

          {/* 5. Job Listings and Applications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Job Listings and Applications</h2>
            <p className="text-gray-700 mb-4">
              Job listings on our platform are provided by third-party employers or recruiting agencies. 
              We do not guarantee the accuracy, completeness, or availability of any job listing.
            </p>
            <p className="text-gray-700 mb-4">
              When you apply for a job through our platform:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• You may be redirected to the employer's website or application system</li>
              <li>• Your application will be subject to the employer's terms and privacy policies</li>
              <li>• We are not responsible for the hiring process or employment decisions</li>
              <li>• We do not guarantee job placement or interview opportunities</li>
            </ul>
          </section>

          {/* 6. Newsletter and Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Newsletter and Communications</h2>
            <p className="text-gray-700 mb-4">
              By subscribing to our newsletter, you consent to receive email communications from us. 
              You may unsubscribe at any time by clicking the unsubscribe link in our emails or 
              contacting us directly.
            </p>
            <p className="text-gray-700">
              We may also send you service-related communications that are necessary for the 
              administration and use of your account.
            </p>
          </section>

          {/* 7. Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              , which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of SixFigHires and its licensors. The Service is protected by 
              copyright, trademark, and other laws.
            </p>
            <p className="text-gray-700">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, 
              publicly perform, republish, download, store, or transmit any of the material on our 
              Service without our prior written consent.
            </p>
          </section>

          {/* 9. Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The information on this Service is provided on an "as is" basis. To the fullest extent 
              permitted by law, we exclude all representations, warranties, and conditions relating to 
              our Service and the use of this Service.
            </p>
            <p className="text-gray-700">
              We do not warrant that the Service will be available, uninterrupted, secure, or error-free. 
              Use of the Service is at your own risk.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall SixFigHires, its directors, employees, partners, agents, suppliers, 
              or affiliates be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your use of the Service.
            </p>
          </section>

          {/* 11. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p className="text-gray-700">
              If you wish to terminate your account, you may simply discontinue using the Service 
              or contact us to request account deletion.
            </p>
          </section>

          {/* 12. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days' notice prior to any 
              new terms taking effect. What constitutes a material change will be determined at our 
              sole discretion.
            </p>
          </section>

          {/* 13. Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be interpreted and governed by the laws of the State of Virginia, 
              United States, without regard to its conflict of law provisions. Our failure to enforce 
              any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@sixfighires.com</p>
              <p className="text-gray-700 mb-2"><strong>Address:</strong> SixFigHires, Woodlawn, Virginia, United States</p>
              <p className="text-gray-700"><strong>Website:</strong> <Link href="/" className="text-blue-600 hover:text-blue-800">sixfighires.com</Link></p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 sm:mb-0">
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 text-sm">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                Contact Us
              </Link>
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                Back to Home
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}