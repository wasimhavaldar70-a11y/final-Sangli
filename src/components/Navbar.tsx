'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, Sparkles } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a]/50 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#c5a880] to-[#b5956a] flex items-center justify-center text-black font-bold text-sm transform group-hover:rotate-12 transition-transform">
              SC
            </div>
            <span className="font-serif text-xl font-bold text-white tracking-wide group-hover:text-[#c5a880] transition-colors">
              Sangli Ceramica
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-[#c5a880] ${
                    isActive ? 'text-[#c5a880]' : 'text-[#a1a1aa]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/appointments"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-4 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#c5a880]/15 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Visit
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#a1a1aa] hover:text-white md:hidden focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-x-0 top-[57px] bg-[#09090b]/95 border-b border-[#27272a] backdrop-blur-lg transition-all duration-300 origin-top ${
          isOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible h-0'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-3 shadow-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[#1c1c1f] text-[#c5a880] border-l-2 border-[#c5a880] pl-4'
                    : 'text-[#a1a1aa] hover:bg-[#121214] hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-[#27272a] px-3">
            <Link
              href="/appointments"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold py-3 rounded-xl shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Book Showroom Visit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
