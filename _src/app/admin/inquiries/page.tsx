'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { Inquiry } from '@/types';
import { 
  Download, MessageSquare, CheckCircle2, XCircle, 
  Clock, AlertCircle, RefreshCw, PhoneCall, Trash2 
} from 'lucide-react';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let data: any[] = [];
      if (isDummy && typeof window !== 'undefined') {
        const stored = localStorage.getItem('fallback_inquiries');
        if (stored) {
          data = JSON.parse(stored);
        } else {
          // Pre-populate with seed mock if empty
          data = [
            { id: '1', customer_name: 'Vikram Salunkhe', phone: '98223 11223', email: 'vikram@gmail.com', message: 'Looking for Kajaria double charge floor tiles 600x1200mm.', status: 'new', created_at: new Date().toISOString() },
            { id: '2', customer_name: 'Suhas Mane', phone: '94220 55443', email: 'suhas@manebuilders.com', message: 'Need quotation for 50 boxes of Carrara Gold Wall tiles.', status: 'contacted', created_at: new Date(Date.now() - 86400000).toISOString() }
          ];
          localStorage.setItem('fallback_inquiries', JSON.stringify(data));
        }
      } else {
        const { data: dbData, error } = await supabase
          .from('inquiries')
          .select('*, products(name, slug)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        data = dbData || [];
      }
      setInquiries(data);
    } catch (e: any) {
      setErrorMsg('Failed to load inquiries: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'contacted' | 'resolved' | 'cancelled') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isDummy) {
        const updated = inquiries.map(inq => {
          if (inq.id === id) {
            return { ...inq, status: newStatus };
          }
          return inq;
        });
        setInquiries(updated);
        localStorage.setItem('fallback_inquiries', JSON.stringify(updated));
        setSuccessMsg(`Status updated to ${newStatus} in Local Cache.`);
        return;
      }

      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setSuccessMsg(`Status updated successfully.`);
      loadInquiries();
    } catch (e: any) {
      setErrorMsg('Failed to update status: ' + e.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isDummy) {
        const updated = inquiries.filter(inq => inq.id !== id);
        setInquiries(updated);
        localStorage.setItem('fallback_inquiries', JSON.stringify(updated));
        setSuccessMsg('Lead deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Lead deleted successfully.');
      loadInquiries();
    } catch (e: any) {
      setErrorMsg('Failed to delete lead: ' + e.message);
    }
  };

  // Convert inquiries to CSV and download
  const handleExportCSV = () => {
    setErrorMsg(null);
    try {
      const csvHeaders = ['Customer Name', 'Phone', 'Email', 'Product ID', 'Message', 'Status', 'Submitted At'];
      const csvRows = inquiries.map(inq => [
        `"${inq.customer_name.replace(/"/g, '""')}"`,
        `"${inq.phone}"`,
        `"${(inq.email || '').replace(/"/g, '""')}"`,
        `"${inq.product_id || ''}"`,
        `"${(inq.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${inq.status}"`,
        `"${inq.created_at}"`
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccessMsg('CSV exported successfully.');
    } catch (err: any) {
      setErrorMsg('Failed to export CSV: ' + err.message);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filterStatus === 'all') return true;
    return inq.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Showroom Leads (Inquiries)
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Review, follow-up, and update status of product inquiries.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredInquiries.length === 0}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          Export Leads CSV
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#27272a]/50 pb-4">
        {['all', 'new', 'contacted', 'resolved', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-colors ${
              filterStatus === status 
                ? 'bg-[#c5a880] text-black font-bold' 
                : 'bg-[#121214] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
          <MessageSquare className="w-12 h-12 text-[#c5a880]/30 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">No inquiries found in this status filter.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#121214] text-[#a1a1aa] border-b border-[#27272a]/50">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Contact details</th>
                  <th className="p-4 font-bold">Related Product</th>
                  <th className="p-4 font-bold">Message</th>
                  <th className="p-4 font-bold">Date Received</th>
                  <th className="p-4 font-bold text-center">Status Action</th>
                  <th className="p-4 font-bold text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]/40">
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#121214]/25 transition-colors">
                    <td className="p-4 font-bold text-white">{inq.customer_name}</td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-white">
                        <PhoneCall className="w-3.5 h-3.5 text-[#c5a880]" />
                        <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                      </div>
                      {inq.email && <span className="text-[10px] text-[#a1a1aa] block">{inq.email}</span>}
                    </td>
                    <td className="p-4 text-[#c5a880] font-semibold max-w-[150px] truncate">
                      {inq.products?.name || 'General Inquiry'}
                    </td>
                    <td className="p-4 text-[#a1a1aa] max-w-[250px] truncate" title={inq.message}>
                      {inq.message}
                    </td>
                    <td className="p-4 text-[#a1a1aa]">
                      {new Date(inq.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value as any)}
                          className="bg-[#121214] border border-[#27272a] text-white text-[11px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#c5a880]"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-2 bg-red-950/20 text-red-400 rounded-lg hover:bg-red-950/50 hover:text-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
