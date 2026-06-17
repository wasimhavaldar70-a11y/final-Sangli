import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      <header className="mb-12">
        <div className="w-12 h-12 rounded-xl bg-[#c5a880]/10 text-[#c5a880] flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-xs text-[#a1a1aa]">Last Updated: June 17, 2026</p>
      </header>

      <div className="prose prose-invert text-xs sm:text-sm text-[#d4d4d8] leading-relaxed space-y-6">
        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">1. Acceptance of Terms</h3>
        <p>
          By accessing the website of Sangli Ceramica, you are agreeing to be bound by these website Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">2. Showroom Material Display</h3>
        <p>
          The materials appearing on Sangli Ceramica&apos;s website could include technical, typographical, or photographic errors. While we make every effort to display high-definition images, tile textures, and colors, we do not warrant that any of the materials on this website are 100% accurate, complete, or current. We strongly encourage visiting the physical showroom to verify finishes and dimensions before placing bulk orders.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">3. Quotations &amp; Estimates</h3>
        <p>
          Product prices listed on the site (if any) or shared via inquiries are estimates only. The actual invoice pricing will depend on shipping, local taxes (GST), bulk quantities requested, and active dealer programs. All finalized quotations are provided in writing by our showroom invoicing desk.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">4. Governing Law</h3>
        <p>
          Any claim relating to Sangli Ceramica&apos;s website shall be governed by the laws of Maharashtra, India without regard to its conflict of law provisions.
        </p>
      </div>
    </div>
  );
}
