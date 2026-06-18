import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0c0c0e] border-t border-[#27272a]/50 text-[#a1a1aa] text-sm pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#c5a880] to-[#b5956a] flex items-center justify-center text-black font-bold text-sm transform group-hover:rotate-12 transition-transform">
                SC
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">
                Sangli Ceramica
              </span>
            </Link>
            <p className="leading-relaxed mb-6">
              Western Maharashtra&apos;s leading destination for premium floor tiles, designer wall coverings, artistic sanitary ware, and luxurious bath fittings. Elevate your spaces with our handpicked international collections.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 rounded-lg bg-[#121214] border border-[#27272a]/65 text-white hover:text-[#c5a880] hover:border-[#c5a880]/30 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="#" className="p-2.5 rounded-lg bg-[#121214] border border-[#27272a]/65 text-white hover:text-[#c5a880] hover:border-[#c5a880]/30 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-[#121214] border border-[#27272a]/65 text-white hover:text-[#25D366] hover:border-[#25D366]/30 transition-colors" aria-label="WhatsApp">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="font-serif text-white text-base font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Products Catalog</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Design Gallery</Link></li>
              <li><Link href="/projects" className="hover:text-white transition-colors">Project Portfolio</Link></li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Inspirational Blogs</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Showroom</Link></li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-serif text-white text-base font-semibold mb-6">Our Collections</h3>
            <ul className="space-y-3">
              <li><Link href="/products?category=floor-tiles" className="hover:text-white transition-colors">Luxury Floor Tiles</Link></li>
              <li><Link href="/products?category=wall-tiles" className="hover:text-white transition-colors">Designer Wall Tiles</Link></li>
              <li><Link href="/products?category=sanitary-ware" className="hover:text-white transition-colors">Premium Sanitary Ware</Link></li>
              <li><Link href="/products?category=bath-fittings-faucets" className="hover:text-white transition-colors">Luxury Faucets & Fittings</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Bathroom Concept Mockups</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-serif text-white text-base font-semibold mb-6">Showroom Details</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-[#c5a880] shrink-0" />
                <span>
                  123, Luxury Showroom Lane, Near Sangli bypass, Sangli, Maharashtra 416416, India
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-[#c5a880] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-[#c5a880] shrink-0" />
                <a href="mailto:info@sangliceramica.com" className="hover:text-white transition-colors">info@sangliceramica.com</a>
              </li>
              <li className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-[#c5a880] shrink-0" />
                <div>
                  <span className="block text-white">Mon - Sat: 9:30 AM - 8:00 PM</span>
                  <span className="text-xs text-red-500">Sunday: Closed</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#27272a]/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} Sangli Ceramica. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
