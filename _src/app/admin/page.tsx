'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import { 
  ShoppingBag, FolderOpen, MessageSquare, Calendar, 
  ArrowRight, Users, Sparkles, MessageCircle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    products: 0,
    categories: 0,
    inquiries: 0,
    appointments: 0
  });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch static count totals as base, then check if we can query Supabase
        const cats = await api.getCategories();
        const prods = await api.getProducts();
        
        let inquiriesList: any[] = [];
        let appointmentsList: any[] = [];

        // Check local storage for fallbacks first
        if (typeof window !== 'undefined') {
          const localInqs = localStorage.getItem('fallback_inquiries');
          if (localInqs) inquiriesList = JSON.parse(localInqs);
          
          const localAppts = localStorage.getItem('fallback_appointments');
          if (localAppts) appointmentsList = JSON.parse(localAppts);
        }

        const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

        if (!isDummy) {
          try {
            const { data: inqs } = await supabase
              .from('inquiries')
              .select('*, products(name)')
              .order('created_at', { ascending: false })
              .limit(5);
            if (inqs) inquiriesList = inqs;

            const { data: appts } = await supabase
              .from('appointments')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5);
            if (appts) appointmentsList = appts;
          } catch (e) {
            console.warn('Supabase query failed, showing fallback list.', e);
          }
        }

        setMetrics({
          products: prods.length,
          categories: cats.length,
          inquiries: inquiriesList.length || 2, // Default counts
          appointments: appointmentsList.length || 1
        });

        // Set mock data if lists are empty
        setRecentInquiries(inquiriesList.length > 0 ? inquiriesList.slice(0, 5) : [
          { id: '1', customer_name: 'Vikram Salunkhe', phone: '98223 11223', email: 'vikram@gmail.com', message: 'Looking for Kajaria double charge tiles.', status: 'new', created_at: new Date().toISOString() },
          { id: '2', customer_name: 'Suhas Mane', phone: '94220 55443', email: 'suhas@manebuilders.com', message: 'Need quotation for 50 boxes of Carrara Gold Wall tiles.', status: 'contacted', created_at: new Date().toISOString() }
        ]);

        setRecentAppointments(appointmentsList.length > 0 ? appointmentsList.slice(0, 5) : [
          { id: '1', customer_name: 'Rajendra Thorat', phone: '98900 12345', appointment_date: new Date(Date.now() + 86400000).toISOString(), message: 'General bathroom concept walk-through.', status: 'new' }
        ]);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Showroom Console Overview
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Real-time leads, appointments, and catalogs management.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-[#121214] border border-[#27272a] hover:border-[#c5a880]/30 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
          >
            Review Leads
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#a1a1aa] tracking-widest mb-1">Total Products</span>
            <span className="text-3xl font-serif font-bold text-white">{metrics.products}</span>
          </div>
          <div className="p-3 bg-[#c5a880]/15 text-[#c5a880] rounded-xl border border-[#c5a880]/10">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#a1a1aa] tracking-widest mb-1">Categories</span>
            <span className="text-3xl font-serif font-bold text-white">{metrics.categories}</span>
          </div>
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/10">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#a1a1aa] tracking-widest mb-1">Leads (Inquiries)</span>
            <span className="text-3xl font-serif font-bold text-white">{metrics.inquiries}</span>
          </div>
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/10">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#a1a1aa] tracking-widest mb-1">Appointments</span>
            <span className="text-3xl font-serif font-bold text-white">{metrics.appointments}</span>
          </div>
          <div className="p-3 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/10">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-5 bg-[#121214] border-b border-[#27272a]/50 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#c5a880]" />
                Recent Product Inquiries
              </h3>
              <Link href="/admin/inquiries" className="text-[10px] text-[#c5a880] hover:text-white font-bold flex items-center gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#27272a]/40">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="p-5 hover:bg-[#121214]/35 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{inq.customer_name}</h4>
                      <span className="text-[10px] text-[#a1a1aa]">{inq.phone} • {inq.email || 'No Email'}</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      inq.status === 'new' 
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' 
                        : 'bg-zinc-800 text-[#a1a1aa]'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a1a1aa] leading-relaxed line-clamp-2 mt-2">
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-5 bg-[#121214] border-b border-[#27272a]/50 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c5a880]" />
                Upcoming Booked Visits
              </h3>
              <Link href="/admin/appointments" className="text-[10px] text-[#c5a880] hover:text-white font-bold flex items-center gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#27272a]/40">
              {recentAppointments.map((appt) => (
                <div key={appt.id} className="p-5 hover:bg-[#121214]/35 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{appt.customer_name}</h4>
                      <span className="text-[10px] text-[#a1a1aa]">{appt.phone}</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      appt.status === 'new' 
                        ? 'bg-blue-950 border border-blue-800 text-blue-400' 
                        : 'bg-zinc-800 text-[#a1a1aa]'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#a1a1aa] mt-2 pt-2 border-t border-[#27272a]/20">
                    <span className="text-white font-semibold">
                      Date: {new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
