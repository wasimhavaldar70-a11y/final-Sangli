import React from 'react';
import Link from 'next/link';
import { Calendar, Phone, Sparkles, Award, MapPin, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121214] border border-[#c5a880]/20 text-[#c5a880] text-[10px] uppercase font-bold tracking-wider">
            <Sparkles className="w-3 h-3" />
            Our Brand Heritage
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            Crafting Spaces of Elegance and Prestige
          </h1>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            Welcome to Sangli Ceramica. Established as Western Maharashtra&apos;s premier destination for high-end tiles and bathroom design, we have been partnering with homeowners, interior architects, and construction developers to translate luxury visions into structural realities.
          </p>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            Our multi-story showroom features dedicated concepts for vitrified floor tiles, ceramic wall highlighter sections, premium water closets, artistic table-top washbasins, and state-of-the-art thermostatic shower panels. We take pride in sourcing and displaying collections that reflect global design trends.
          </p>
        </div>
        <div className="lg:col-span-6 aspect-video lg:aspect-square rounded-2xl overflow-hidden border border-[#27272a]/50 relative bg-[#1c1c1f]">
          <img 
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800" 
            alt="Sangli Ceramica Showroom Design" 
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Showroom Features */}
      <section className="bg-[#0c0c0e] py-16 px-8 rounded-3xl border border-[#27272a]/30">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-3">Our Core Philosophy</h2>
          <p className="text-xs text-[#a1a1aa]">How we separate ourselves from typical distribution outlets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
              Curated Selection
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We do not display mass-market stock. Every vitrified marble pattern and rose gold basin mixer is personally audited for finish quality, dimensional uniformity, and aesthetic premiumness.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
              Expert Consulting
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Our showroom consultants have architectural and design training. We don&apos;t just sell packages; we review layout drawings, recommend complementary color finishes, and calculate tile size estimates.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
              Supply Consistency
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We collaborate with high-performance shipping networks to ensure that products arrive at construction sites on time, minimizing delay costs.
            </p>
          </div>
        </div>
      </section>

      {/* Banner / Booking CTA */}
      <section className="glass-panel p-12 rounded-3xl border border-[#27272a]/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08),transparent_70%)] pointer-events-none" />
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-4">
          Experience the Luxury First-Hand
        </h2>
        <p className="max-w-xl mx-auto text-xs text-[#a1a1aa] mb-8 leading-relaxed">
          Walk through our concept bathrooms and touch our physical wood grain tile textures. Book an appointment with our specialists today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/appointments"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-6 py-3.5 rounded-full hover:shadow-lg transition-all"
          >
            <Calendar className="w-4 h-4" />
            Book Showroom Visit
          </Link>
          <a
            href="tel:+919876543210"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#121214] hover:bg-[#1c1c1f] text-white border border-[#27272a] font-semibold text-xs px-6 py-3.5 rounded-full transition-colors"
          >
            <Phone className="w-4 h-4 text-[#c5a880]" />
            Call +91 98765 43210
          </a>
        </div>
      </section>
    </div>
  );
}
