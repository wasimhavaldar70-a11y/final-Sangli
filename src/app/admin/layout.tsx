'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, Image as ImageIcon, 
  Briefcase, Star, MessageSquare, Calendar, BookOpen, Settings, 
  LogOut, Menu, X, Sparkles 
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Gallery CMS', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Projects CMS', href: '/admin/projects', icon: Briefcase },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'Inquiries (Leads)', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Blogs CMS', href: '/admin/blogs', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row text-white">
      {/* Top Header for Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#121214] border-b border-[#27272a]/60">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-[#c5a880] to-[#b5956a] flex items-center justify-center text-black font-bold text-xs">
            SC
          </div>
          <span className="font-serif text-sm font-bold tracking-wide">SC Admin</span>
        </Link>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-1 text-[#a1a1aa] hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0c0c0e] border-r border-[#27272a]/50 flex flex-col justify-between py-6 px-4
        transform md:translate-x-0 transition-transform duration-300 md:static md:h-screen shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Header */}
          <Link href="/" className="flex items-center gap-2 px-3">
            <div className="w-7 h-7 rounded bg-gradient-to-r from-[#c5a880] to-[#b5956a] flex items-center justify-center text-black font-bold text-xs">
              SC
            </div>
            <span className="font-serif text-base font-bold text-white tracking-wide">
              Sangli Ceramica
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                    isActive 
                      ? 'bg-[#c5a880] text-black font-bold' 
                      : 'text-[#a1a1aa] hover:bg-[#121214] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-[#27272a]/50 px-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1c1f] flex items-center justify-center text-xs font-bold text-[#c5a880] border border-[#c5a880]/15">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none mb-0.5">Admin Manager</p>
              <span className="text-[10px] text-[#a1a1aa]">Authorized Staff</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <main className="flex-1 p-6 sm:p-10 bg-[#09090b]">
          {children}
        </main>
      </div>
    </div>
  );
}
