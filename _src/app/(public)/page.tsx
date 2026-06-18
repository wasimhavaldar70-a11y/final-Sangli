'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Category, Product, Testimonial, Project } from '@/types';
import { 
  ArrowRight, Sparkles, Gem, Award, ShieldCheck, 
  MapPin, Clock, MessageSquare, Calendar, Star 
} from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, tests, projs] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featuredOnly: true }),
          api.getTestimonials(),
          api.getProjects()
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.slice(0, 3));
        setTestimonials(tests);
        setProjects(projs.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  return (
    <div className="bg-[#09090b]">
      {/* Google LocalBusiness Schema for Local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Sangli Ceramica",
            "image": "https://sangliceramica.com/images/showroom.jpg",
            "@id": "https://sangliceramica.com/#showroom",
            "url": "https://sangliceramica.com",
            "telephone": "+91 98765 43210",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123, Luxury Showroom Lane, Near Sangli bypass",
              "addressLocality": "Sangli",
              "addressRegion": "Maharashtra",
              "postalCode": "416416",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 16.847528,
              "longitude": 74.582845
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:30",
              "closes": "20:00"
            }
          })
        }}
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden border-b border-[#27272a]/20">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,168,128,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0)_50%,rgba(9,9,11,1)_100%)] z-10" />
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121214] border border-[#c5a880]/20 text-[#c5a880] text-xs font-semibold uppercase tracking-wider mb-6 animate-slide-up">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Showroom in Maharashtra
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-tight mb-8">
            Bespoke Tiles &amp; <span className="text-gradient bg-gradient-to-r from-[#c5a880] via-[#e8d09f] to-[#b5956a] bg-clip-text text-transparent">Luxury Fittings</span> for Modern Living
          </h1>
          
          <p className="max-w-2xl mx-auto text-[#a1a1aa] text-base sm:text-lg md:text-xl leading-relaxed mb-12">
            Explore our curated collections of premium imported marble-finish tiles, designer sanitary ware, and modern bath fittings designed to elevate your architectural vision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] hover:from-[#e8d09f] hover:to-[#c5a880] text-black font-semibold px-8 py-4 rounded-full text-sm shadow-xl shadow-[#c5a880]/10 hover:shadow-[#c5a880]/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/appointments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#121214] hover:bg-[#1c1c1f] text-white border border-[#27272a] hover:border-[#c5a880]/30 font-semibold px-8 py-4 rounded-full text-sm transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#c5a880]" />
              Book Showroom Visit
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Our Curated Categories</h2>
          <div className="w-20 h-1 bg-[#c5a880] mx-auto rounded-full mb-6" />
          <p className="max-w-xl mx-auto text-[#a1a1aa]">Discover an range of high-definition textures, custom ceramics, and designer utilities.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-[#121214] border border-[#27272a]/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/products?category=${cat.slug}`}
                className="group relative h-80 rounded-2xl overflow-hidden border border-[#27272a]/40 shadow-xl transition-all duration-500 hover:border-[#c5a880]/30"
              >
                {/* Image Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                  style={{ backgroundImage: `url(${cat.image_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-350">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#c5a880] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-24 bg-[#0c0c0e] border-y border-[#27272a]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Featured Collections</h2>
              <div className="w-20 h-1 bg-[#c5a880] rounded-full" />
            </div>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-sm text-[#c5a880] hover:text-white font-semibold group transition-colors"
            >
              View All Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-96 rounded-2xl bg-[#121214] border border-[#27272a]/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="group bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/45 shadow-xl hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1c1f]">
                    <img
                      src={prod.product_images?.[0]?.image_url || '/images/placeholder.jpg'}
                      alt={prod.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#c5a880] tracking-widest border border-[#c5a880]/20">
                      {prod.brand}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#c5a880] transition-colors mb-2">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mb-4 line-clamp-2 flex-grow">
                      {prod.description}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-[#27272a]/50 mt-auto">
                      <span className="text-[#c5a880] font-semibold text-sm">
                        {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : 'Contact for Quote'}
                      </span>
                      <span className="text-xs text-[#a1a1aa] flex items-center gap-1">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Why Choose Sangli Ceramica</h2>
          <div className="w-20 h-1 bg-[#c5a880] mx-auto rounded-full mb-6" />
          <p className="max-w-xl mx-auto text-[#a1a1aa]">We deliver premium quality, architectural advice, and a flawless purchase experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 text-center relative group">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/10 text-[#c5a880] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Gem className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Premium Collections</h3>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Curated luxury range including high-gloss vitrified tiles, custom ceramic wall patterns, and modern German-designed bath fixtures.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 text-center relative group">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/10 text-[#c5a880] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">20+ Years Excellence</h3>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Serving architects, developers, and homeowners in Western Maharashtra with consistent quality, reliable delivery, and support.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 text-center relative group">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/10 text-[#c5a880] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">100% Genuine Brands</h3>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Authorised dealer for top-tier brands including Kajaria, Somany, Jaquar, Hindware, and Grohe. Complete manufacturer warranty coverage.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PORTFOLIO SHOWCASE */}
      <section className="py-24 bg-[#0c0c0e] border-y border-[#27272a]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Latest Reference Projects</h2>
            <div className="w-20 h-1 bg-[#c5a880] mx-auto rounded-full mb-6" />
            <p className="max-w-xl mx-auto text-[#a1a1aa]">See how our tiles and bath products transform residential villas and commercial spaces.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-[#121214] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((proj) => (
                <div key={proj.id} className="group relative h-80 rounded-2xl overflow-hidden shadow-2xl border border-[#27272a]/40">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                    style={{ backgroundImage: `url(${proj.image_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                    <span className="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {proj.location}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white mb-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {proj.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Customer Endorsements</h2>
          <div className="w-20 h-1 bg-[#c5a880] mx-auto rounded-full mb-6" />
          <p className="max-w-xl mx-auto text-[#a1a1aa]">Read reviews from Western Maharashtra&apos;s leading architects and builders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test) => (
            <div key={test.id} className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 flex flex-col justify-between relative">
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c5a880] text-[#c5a880]" />
                  ))}
                </div>
                <p className="text-[#a1a1aa] italic text-sm leading-relaxed mb-6">
                  &ldquo;{test.review}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-[#27272a]/50">
                <img
                  src={test.image_url}
                  alt={test.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white font-bold text-sm">{test.name}</h4>
                  <span className="text-xs text-[#c5a880]">{test.designation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SHOWROOM INFORMATION & GOOGLE MAPS */}
      <section className="py-24 bg-[#0c0c0e] border-t border-[#27272a]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Showroom Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">Visit Our Showroom</h2>
              <p className="text-[#a1a1aa] mb-8 leading-relaxed">
                Experience our textures and scale first-hand. Consult with our product experts to find the right materials, sizes, and bath fittings for your commercial or residential project.
              </p>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl text-[#c5a880]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Our Address</h4>
                    <p className="text-xs text-[#a1a1aa]">
                      123, Luxury Showroom Lane, Near Sangli bypass, Sangli, Maharashtra 416416, India
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl text-[#c5a880]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Working Hours</h4>
                    <p className="text-xs text-[#a1a1aa]">
                      Monday - Saturday: 9:30 AM - 8:00 PM <br />
                      <span className="text-red-500">Sunday: Closed</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold px-6 py-3 rounded-full text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Inquire on WhatsApp
                </a>
                <Link
                  href="/appointments"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold px-6 py-3 rounded-full text-xs transition-all shadow-md shadow-[#c5a880]/5"
                >
                  <Calendar className="w-4 h-4" />
                  Book Showroom Visit
                </Link>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="lg:col-span-7 h-96 lg:h-auto min-h-[350px] rounded-2xl overflow-hidden border border-[#27272a]/50 relative">
              <iframe
                title="Sangli Ceramica Showroom Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.5721111623826!2d74.58284561486835!3d16.847528388405086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x8e83b8b1a8d052b6!2sSangli%20Ceramica!5e0!3m2!1sen!2sin!4v1624000000000!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full border-0 grayscale invert contrast-125 opacity-70"
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
