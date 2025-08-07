import Hero from '@/components/NavBar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy | SixFigHires.com',
  description: 'How we collect, use, and protect your data at SixFigHires.com.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Hero />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          At SixFigHires, we take your privacy seriously. This policy outlines how we collect, use, and safeguard your information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Email address (for newsletters, login, and account features)</li>
          <li>Saved job data or preferences (optional)</li>
          <li>Basic analytics to improve the site (e.g., Google Analytics)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Data</h2>
        <ul className="list-disc list-inside mb-4">
          <li>To send you job updates or alerts (only if subscribed)</li>
          <li>To personalize your experience on the platform</li>
          <li>To improve the site through anonymous analytics</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Sharing</h2>
        <p className="mb-4">
          We do <strong>not</strong> sell your data. We may use trusted third-party services like Supabase, Google, or Vercel to support functionality — each with their own privacy policies.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Choices</h2>
        <p className="mb-4">
          You can opt out of emails anytime or request deletion of your account by contacting us directly.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy. When we do, the date below will be updated.
        </p>

        <p className="text-sm text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
      </main>
      <Footer />
    </>
  )
}
