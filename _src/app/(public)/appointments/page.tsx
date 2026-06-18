'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Calendar, Phone, CheckCircle2, Loader2, Clock, Sparkles } from 'lucide-react';

export default function AppointmentBookingPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const combinedDateTime = new Date(`${date}T${time}`).toISOString();
      const result = await api.createAppointment({
        customer_name: name,
        phone,
        email: email || undefined,
        appointment_date: combinedDateTime,
        message: message || 'Booking a general showroom consultation'
      });

      if (result) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setDate('');
        setMessage('');
      } else {
        throw new Error('Failed to book appointment. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch w-full">
        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121214] border border-[#c5a880]/20 text-[#c5a880] text-[10px] uppercase font-bold tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              Bespoke Customer Service
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Book a Showroom Consultation
            </h1>
            <p className="text-sm text-[#a1a1aa] leading-relaxed mb-8">
              Schedule a personalized one-on-one walkthrough with our interior design experts. Let us guide you through our product tiles, sanitary closets, and bath fitting setups.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl text-[#c5a880] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Standard Duration</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Consultations generally take 45–60 minutes.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl text-[#c5a880] shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Need Immediate Help?</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Give us a direct call at <a href="tel:+919876543210" className="text-white hover:underline">+91 98765 43210</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 shadow-2xl relative h-full flex flex-col justify-center">
            {success ? (
              <div className="p-8 bg-green-950/45 border border-green-800/40 rounded-xl text-center my-8">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-white font-bold text-lg mb-1">Showroom Visit Booked!</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed mb-6">
                  Thank you! Your request has been confirmed. Our coordinator will call you shortly to verify your schedule slot.
                </p>
                <Link 
                  href="/"
                  className="inline-flex bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-6 py-3 rounded-full"
                >
                  Return to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-white mb-6">Select Appointment Schedule</h3>

                {errorMsg && (
                  <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Your Full Name *
                    </label>
                    <input 
                      id="name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Patil"
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Phone Number *
                    </label>
                    <input 
                      id="phone"
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                    Email Address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@patilconstructions.com (Optional)"
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Desired Date *
                    </label>
                    <input 
                      id="date"
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Desired Time *
                    </label>
                    <select
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                    Consultation Details / Notes
                  </label>
                  <textarea 
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Planning a kitchen renovation, looking to purchase sanitary closets for a new residential apartment project etc."
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c5a880] to-[#b5956a] hover:from-[#e8d09f] hover:to-[#c5a880] text-black font-semibold text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Requesting Appointment...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      Book Consultation Slot
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
