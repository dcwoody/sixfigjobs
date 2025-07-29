import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
    title: 'About Us | SixFigHires.com',
    description:
        'Learn more about SixFigHires — our mission, values, and how we help professionals discover high-paying opportunities.',
}

export default function AboutPage() {
    return (
        <>
            <Hero />
            <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
                <h1 className="text-4xl font-bold mb-6">About SixFigHires</h1>

                <p className="mb-4 text-lg">
                    SixFigHires is your trusted source for six-figure jobs across government, tech, nonprofit, and private
                    sectors — with a focus on the Washington, DC metro area.
                </p>

                <p className="mb-4 text-lg">
                    We combine curated job listings with modern filtering tools, AI-enhanced descriptions, and verified salary
                    data — giving job seekers a smarter, faster way to discover high-paying career opportunities.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
                <p className="mb-4">
                    We believe that great jobs shouldn&rsquo;t be buried behind vague listings and confusing platforms. Our mission is
                    to surface clear, high-quality job opportunities that offer transparency, impact, and growth.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">Who We Serve</h2>
                <p className="mb-4">
                    Whether you&rsquo;re a policy expert, tech lead, nonprofit strategist, or cleared professional, we help ambitious
                    people find roles that match their value — and pay them what they&rsquo;re worth.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">Let&rsquo;s Connect</h2>
                <p className="mb-6">
                    Have questions or want to partner with us?{' '}
                    <Link href="/contact" className="text-blue-600 underline">
                        Contact us
                    </Link>{' '}
                    — we&rsquo;d love to hear from you.
                </p>
            </main>
            <Footer />
        </>
    )
}
