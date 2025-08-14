// src/app/about/page.tsx
//import Image from "next/image";
import Link from "next/link";
//import Footer from "@/components/Footer";
import { Users, TrendingUp, Award, Target, CheckCircle, Star, Briefcase } from "lucide-react";

export const metadata = {
  title: "About SixFigHires — Curated $100k+ Jobs",
  description:
    "SixFigHires connects ambitious professionals with verified $100k+ opportunities. Learn our mission, values, and the team behind the job board.",
};

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Connecting Top Talent with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                $100k+
              </span>{' '}
              Opportunities
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              SixFigHires is a curated job board for high-earning professionals. We source verified $100k+ roles
              from trustworthy employers so you can spend less time searching—and more time leveling up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Browse $100k+ Jobs
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-800 font-semibold rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all"
              >
                Explore Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering ambitious professionals to reach their income goals
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We believe that finding high-quality, six-figure opportunities should be simple and transparent. 
              That's why we vet every employer, standardize salary information, and highlight the benefits that 
              matter most to ambitious professionals.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Our platform doesn't just connect you with jobs—it empowers you to evaluate offers with clarity, 
              understand your market value, and negotiate with confidence.
            </p>
            
            {/* Key Benefits */}
            <div className="space-y-4">
              {[
                "Pre-vetted employers and verified salary ranges",
                "Transparent compensation and benefits information",
                "Direct connections with hiring managers",
                "Career advancement resources and salary insights"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-8 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">500+</div>
              <div className="text-sm font-medium text-blue-700">New $100k+ jobs weekly</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-8 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">300+</div>
              <div className="text-sm font-medium text-purple-700">Verified employers</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-8 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-2">50k+</div>
              <div className="text-sm font-medium text-green-700">Active job seekers</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-8 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-900 mb-2">2,000+</div>
              <div className="text-sm font-medium text-orange-700">Annual placements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-gray-600">
              Trust, quality, and results guide every product decision and every job we publish.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Be World‑Class</h3>
              <p className="text-gray-700 leading-relaxed">
                We curate only high‑signal roles—clear scope, competitive compensation, and credible teams. 
                Every job meets our strict quality standards.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Radical Transparency</h3>
              <p className="text-gray-700 leading-relaxed">
                Wherever possible, we display salary ranges, equity, and benefits up front—no guesswork, 
                no surprises, just clear information.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Candidate First</h3>
              <p className="text-gray-700 leading-relaxed">
                Tools and insights that help you compare offers, prepare faster, and negotiate confidently. 
                Your success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Leading Companies</h2>
          <p className="text-xl text-gray-600">
            From Fortune 500 to fast-growing startups, top companies choose SixFigHires
          </p>
        </div>
        
        {/* Placeholder for company logos - replace with actual logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg p-6 w-32 h-20 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">Company {i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet the Team</h2>
            <p className="text-xl text-gray-600">
              We're builders, operators, and career enthusiasts on a mission to make six‑figure careers more accessible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full mb-6 bg-gradient-to-r from-blue-400 to-purple-500 p-1">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  {/* Replace with actual team photos */}
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Jake Wood</h3>
              <p className="text-blue-600 font-medium mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-600">
                Former tech executive passionate about connecting talent with opportunity.
              </p>
            </div>
            
            {/* Add more team members as needed */}
            <div className="text-center group">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full mb-6 bg-gradient-to-r from-green-400 to-blue-500 p-1">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sarah Chen</h3>
              <p className="text-blue-600 font-medium mb-2">Head of Product</p>
              <p className="text-sm text-gray-600">
                Product leader focused on creating exceptional user experiences.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full mb-6 bg-gradient-to-r from-purple-400 to-pink-500 p-1">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Marcus Johnson</h3>
              <p className="text-blue-600 font-medium mb-2">VP of Engineering</p>
              <p className="text-sm text-gray-600">
                Technical leader building scalable platforms for career growth.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full mb-6 bg-gradient-to-r from-orange-400 to-red-500 p-1">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Emily Rodriguez</h3>
              <p className="text-blue-600 font-medium mb-2">Head of Partnerships</p>
              <p className="text-sm text-gray-600">
                Relationship builder connecting top companies with our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for your next $100k+ move?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've found their dream jobs through SixFigHires. 
            Get fresh six‑figure roles, salary intel, and company insights delivered weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              Browse Jobs Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}