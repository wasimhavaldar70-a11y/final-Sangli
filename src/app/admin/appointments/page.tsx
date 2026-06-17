'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { Appointment } from '@/types';
import { 
  Download, Calendar, CheckCircle2, XCircle, 
  Clock, AlertCircle, PhoneCall, Trash2, CalendarCheck 
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let data: any[] = [];
      if (isDummy && typeof window !== 'undefined') {
        const stored = localStorage.getItem('fallback_appointments');
        if (stored) {
          data = JSON.parse(stored);
        } else {
          data = [
            { id: '1', customer_name: 'Rajendra Thorat', phone: '98900 12345', email: 'rajendra@gmail.com', appointment_date: new Date(Date.now() + 86400000).toISOString(), message: 'General bathroom concept walk-through.', status: 'new', created_at: new Date().toISOString() }
          ];
          localStorage.setItem('fallback_appointments', JSON.stringify(data));
        }
      } else {
        const { data: dbData, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });
        
        if (error) throw error;
        data = dbData || [];
      }
      setAppointments(data);
    } catch (e: any) {
      setErrorMsg('Failed to load appointments: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'confirmed' | 'completed' | 'cancelled') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isDummy) {
        const updated = appointments.map(appt => {
          if (appt.id === id) {
            return { ...appt, status: newStatus };
          }
          return appt;
        });
        setAppointments(updated);
        localStorage.setItem('fallback_appointments', JSON.stringify(updated));
        setSuccessMsg(`Status updated to ${newStatus} in Local Cache.`);
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setSuccessMsg(`Status updated successfully.`);
      loadAppointments();
    } catch (e: any) {
      setErrorMsg('Failed to update status: ' + e.message);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking record?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isDummy) {
        const updated = appointments.filter(appt => appt.id !== id);
        setAppointments(updated);
        localStorage.setItem('fallback_appointments', JSON.stringify(updated));
        setSuccessMsg('Record deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Record deleted successfully.');
      loadAppointments();
    } catch (e: any) {
      setErrorMsg('Failed to delete booking: ' + e.message);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filterStatus === 'all') return true;
    return appt.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Showroom Bookings
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Review and coordinate upcoming client visits.</p>
        </div>
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
        {['all', 'new', 'confirmed', 'completed', 'cancelled'].map((status) => (
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
      ) : filteredAppointments.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
          <CalendarCheck className="w-12 h-12 text-[#c5a880]/30 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">No appointments booked in this filter status.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#121214] text-[#a1a1aa] border-b border-[#27272a]/50">
                  <th className="p-4 font-bold">Client Name</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Visit Date &amp; Time</th>
                  <th className="p-4 font-bold">Client Notes</th>
                  <th className="p-4 font-bold text-center">Status Action</th>
                  <th className="p-4 font-bold text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]/40">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#121214]/25 transition-colors">
                    <td className="p-4 font-bold text-white">{appt.customer_name}</td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-white">
                        <PhoneCall className="w-3.5 h-3.5 text-[#c5a880]" />
                        <a href={`tel:${appt.phone}`} className="hover:underline">{appt.phone}</a>
                      </div>
                      {appt.email && <span className="text-[10px] text-[#a1a1aa] block">{appt.email}</span>}
                    </td>
                    <td className="p-4 text-white font-semibold">
                      {new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-[#a1a1aa] max-w-[250px] truncate" title={appt.message}>
                      {appt.message}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateStatus(appt.id, e.target.value as any)}
                          className="bg-[#121214] border border-[#27272a] text-white text-[11px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#c5a880]"
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
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
