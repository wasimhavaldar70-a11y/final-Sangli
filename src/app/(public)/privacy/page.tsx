import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#a1a1aa]">Last Updated: June 17, 2026</p>
      </header>

      <div className="prose prose-invert text-xs sm:text-sm text-[#d4d4d8] leading-relaxed space-y-6">
        <p>
          At Sangli Ceramica, accessible from our showroom site, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Sangli Ceramica and how we use it.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">1. Information We Collect</h3>
        <p>
          The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
        </p>
        <p>
          If you contact us directly via our inquiry form or appointment scheduler, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">2. How We Use Your Information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain our website and lead collection.</li>
          <li>Improve, personalize, and expand our customer services.</li>
          <li>Understand and analyze how you use our website catalog.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>Communicate with you to coordinate appointments or answer inquiries.</li>
        </ul>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">3. Database Security</h3>
        <p>
          We store all contact information, product inquiries, and visit schedules securely inside Supabase PostgreSQL databases with strict Row-Level Security (RLS) policies. Only authenticated showroom managers can view or edit your submission data.
        </p>

        <h3 className="font-serif text-white font-bold text-base mt-8 mb-4">4. Contact Us</h3>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:info@sangliceramica.com" className="text-white underline hover:text-[#c5a880]">info@sangliceramica.com</a>.
        </p>
      </div>
    </div>
  );
}
