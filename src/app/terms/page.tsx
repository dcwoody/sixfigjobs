import Hero from '@/components/NavBar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Use | SixFigHires.com',
  description: 'Terms of Use for SixFigHires.com — please review before using the site.',
}

export default function TermsOfUsePage() {
  return (
    <>
      <Hero />
      <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-4xl font-bold mb-6">Terms of Use</h1>

        <p className="mb-4">
          Welcome to SixFigHires.com. By using our site, you agree to these Terms of Use. Please read them carefully.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of the Site</h2>
        <p className="mb-4">
          You may use this site only for lawful purposes related to job searching, hiring, and exploring career content. Misuse, including unauthorized scraping, spam, or abusive behavior, is strictly prohibited.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
        <p className="mb-4">
          If you create an account, you are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate information and notify us of any unauthorized use of your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Job Content</h2>
        <p className="mb-4">
          Job listings and company descriptions are either user-submitted or aggregated from public sources. We make reasonable efforts to ensure accuracy but do not guarantee completeness or correctness.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
        <p className="mb-4">
          All content on this site, including logos, layout, and design, is the property of SixFigHires unless otherwise stated. Do not reproduce or distribute content without permission.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          We are not responsible for any loss, damage, or missed opportunities resulting from your use of this site. All content is provided “as is” without warranties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to These Terms</h2>
        <p className="mb-4">
          We may update these Terms of Use from time to time. Continued use of the site after changes implies acceptance of the new terms.
        </p>

        <p className="text-sm text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
      </main>
      <Footer />
    </>
  )
}
