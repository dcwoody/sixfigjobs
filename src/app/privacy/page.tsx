// src/app/privacy/page.tsx
import Link from 'next/link';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - SixFigHires',
  description: 'Privacy Policy and data protection practices for SixFigHires job board platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Privacy Commitment */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-green-800 font-semibold mb-2">Our Privacy Commitment</h3>
              <p className="text-green-700 text-sm">
                At SixFigHires, we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          
          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              SixFigHires ("we," "our," or "us") operates the SixFigHires website and job board platform 
              (the "Service"). This Privacy Policy informs you of our policies regarding the collection, 
              use, and disclosure of personal information when you use our Service.
            </p>
            <p className="text-gray-700">
              By using the Service, you agree to the collection and use of information in accordance 
              with this Privacy Policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We may collect the following types of personal information when you use our Service:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6 mb-6">
              <li>• <strong>Account Information:</strong> Name, email address, password</li>
              <li>• <strong>Profile Information:</strong> Professional background, skills, career preferences</li>
              <li>• <strong>Contact Information:</strong> Phone number, location, address (optional)</li>
              <li>• <strong>Resume/CV:</strong> Work experience, education, certifications</li>
              <li>• <strong>Communication Data:</strong> Messages, support requests, feedback</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information when you visit our Service:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6 mb-6">
              <li>• <strong>Usage Data:</strong> Pages visited, time spent, clicks, search queries</li>
              <li>• <strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li>• <strong>Log Data:</strong> Access times, error logs, referral URLs</li>
              <li>• <strong>Cookies and Tracking:</strong> Session cookies, preference cookies, analytics cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Third-Party Information</h3>
            <p className="text-gray-700">
              We may receive information about you from third parties, such as:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• Social media platforms (if you choose to connect your accounts)</li>
              <li>• Professional networking sites</li>
              <li>• Employers and recruiting partners</li>
              <li>• Analytics and marketing partners</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Service Delivery:</strong> Provide and maintain our job board platform</li>
              <li>• <strong>Account Management:</strong> Create and manage your user account</li>
              <li>• <strong>Job Matching:</strong> Recommend relevant job opportunities</li>
              <li>• <strong>Communication:</strong> Send newsletters, job alerts, and service updates</li>
              <li>• <strong>Improvement:</strong> Analyze usage patterns to enhance our Service</li>
              <li>• <strong>Support:</strong> Respond to inquiries and provide customer support</li>
              <li>• <strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
              <li>• <strong>Marketing:</strong> Send promotional materials (with your consent)</li>
            </ul>
          </section>

          {/* 4. Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Your Consent</h3>
            <ul className="text-gray-700 space-y-2 ml-6 mb-4">
              <li>• When you apply for jobs (your information is shared with employers)</li>
              <li>• When you explicitly consent to sharing with specific third parties</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
            <ul className="text-gray-700 space-y-2 ml-6 mb-4">
              <li>• Cloud hosting providers (for data storage and processing)</li>
              <li>• Email service providers (for newsletters and communications)</li>
              <li>• Analytics providers (for usage analysis and improvement)</li>
              <li>• Payment processors (for subscription services)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• To comply with legal obligations or court orders</li>
              <li>• To protect our rights, property, or safety</li>
              <li>• To investigate fraud, security issues, or violations of our terms</li>
              <li>• In connection with a merger, acquisition, or asset sale</li>
            </ul>
          </section>

          {/* 5. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or destruction:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
              <li>• <strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
              <li>• <strong>Regular Audits:</strong> Security practices are regularly reviewed and updated</li>
              <li>• <strong>Secure Infrastructure:</strong> Use of secure cloud providers and hosting services</li>
              <li>• <strong>Employee Training:</strong> Staff are trained on data protection best practices</li>
            </ul>
          </section>

          {/* 6. Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to provide our services 
              and fulfill the purposes outlined in this Privacy Policy:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Active Accounts:</strong> Information is retained while your account is active</li>
              <li>• <strong>Inactive Accounts:</strong> Information may be retained for up to 3 years after last activity</li>
              <li>• <strong>Legal Requirements:</strong> Some information may be retained longer to meet legal obligations</li>
              <li>• <strong>Anonymized Data:</strong> Aggregated, anonymized data may be retained indefinitely for analytics</li>
            </ul>
          </section>

          {/* 7. Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">
              You have certain rights regarding your personal information:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Access:</strong> Request access to your personal information</li>
              <li>• <strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
              <li>• <strong>Portability:</strong> Request a copy of your information in a portable format</li>
              <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li>• <strong>Object:</strong> Object to certain processing of your information</li>
              <li>• <strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at privacy@sixfighires.com
            </p>
          </section>

          {/* 8. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Types of Cookies</h3>
            <ul className="text-gray-700 space-y-2 ml-6 mb-4">
              <li>• <strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
              <li>• <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Managing Cookies</h3>
            <p className="text-gray-700">
              You can control cookies through your browser settings. However, disabling certain 
              cookies may affect the functionality of our Service.
            </p>
          </section>

          {/* 9. Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our Service may contain links to third-party websites or integrate with third-party services. 
              We are not responsible for the privacy practices of these third parties. We encourage you 
              to read their privacy policies.
            </p>
            <p className="text-gray-700">
              Third-party services we may use include:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• Google Analytics (for website analytics)</li>
              <li>• Social media platforms (for social login and sharing)</li>
              <li>• Email service providers (for communications)</li>
              <li>• Cloud storage providers (for data hosting)</li>
            </ul>
          </section>

          {/* 10. International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country 
              of residence. We ensure that such transfers are made in accordance with applicable privacy 
              laws and with appropriate safeguards in place to protect your information.
            </p>
          </section>

          {/* 11. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
            <p className="text-gray-700">
              Our Service is not intended for use by children under the age of 18. We do not knowingly 
              collect personal information from children under 18. If you are a parent or guardian and 
              believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          {/* 12. Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "last updated" date. 
              For material changes, we may also send you an email notification.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2"><strong>Privacy Officer:</strong> privacy@sixfighires.com</p>
              <p className="text-gray-700 mb-2"><strong>General Inquiries:</strong> support@sixfighires.com</p>
              <p className="text-gray-700 mb-2"><strong>Address:</strong> SixFigHires, Woodlawn, Virginia, United States</p>
              <p className="text-gray-700"><strong>Website:</strong> <Link href="/" className="text-blue-600 hover:text-blue-800">sixfighires.com</Link></p>
            </div>
          </section>

          {/* 14. California Privacy Rights (CCPA) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Right to Know:</strong> Request information about personal information collected, used, or shared</li>
              <li>• <strong>Right to Delete:</strong> Request deletion of personal information</li>
              <li>• <strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>• <strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your privacy rights</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at privacy@sixfighires.com or call us at our toll-free number.
            </p>
          </section>

          {/* 15. European Privacy Rights (GDPR) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. European Privacy Rights (GDPR)</h2>
            <p className="text-gray-700 mb-4">
              If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="text-gray-700 space-y-2 ml-6">
              <li>• <strong>Lawful Basis:</strong> We process your data based on consent, contract performance, or legitimate interests</li>
              <li>• <strong>Data Subject Rights:</strong> Access, rectification, erasure, portability, restriction, and objection</li>
              <li>• <strong>Data Protection Officer:</strong> Contact our DPO at dpo@sixfighires.com</li>
              <li>• <strong>Supervisory Authority:</strong> You have the right to lodge a complaint with your local data protection authority</li>
            </ul>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 sm:mb-0">
              <Link href="/terms" className="text-blue-600 hover:text-blue-800 text-sm">
                Terms of Service
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
    </div>
  );
}