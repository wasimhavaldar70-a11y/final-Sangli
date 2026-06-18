'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      const result = await api.createInquiry({
        customer_name: name,
        phone,
        email: email || undefined,
        message: message || 'General inquiry from Contact Us page.'
      });

      if (result) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Failed to submit message. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Contact Showroom</h1>
        <div className="w-16 h-1 bg-[#c5a880] mb-6 mx-auto sm:mx-0 rounded-full" />
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Have questions about pricing, catalogs, or custom designs? Get in touch with our team or schedule a visit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-24">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 space-y-6">
            <h3 className="font-serif text-xl font-bold text-white mb-4">Showroom Contact Info</h3>
            
            <div className="flex gap-4 items-start">
              <MapPin className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Showroom Address</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  123, Luxury Showroom Lane, Near Sangli bypass, Sangli, Maharashtra 416416, India
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Phone className="w-5 h-5 text-[#c5a880] shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Call Representative</h4>
                <a href="tel:+919876543210" className="text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Mail className="w-5 h-5 text-[#c5a880] shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Email Inquiry</h4>
                <a href="mailto:info@sangliceramica.com" className="text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors">
                  info@sangliceramica.com
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Clock className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Operating Hours</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Monday - Saturday: 9:30 AM - 8:00 PM <br />
                  <span className="text-red-500">Sunday: Closed</span>
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 text-center">
            <h4 className="text-white font-bold text-sm mb-3">WhatsApp Inquiry Channel</h4>
            <p className="text-xs text-[#a1a1aa] mb-4">Direct contact to our lead sales representative.</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-6 py-3 rounded-xl text-xs w-full transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 shadow-xl relative h-full flex flex-col justify-center">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Send Us a Message</h3>
            <p className="text-xs text-[#a1a1aa] mb-6">Leave us a comment, question, or request and our sales team will respond.</p>

            {success ? (
              <div className="p-8 bg-green-950/45 border border-green-800/40 rounded-xl text-center my-6">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-white font-bold text-base mb-1">Message Submitted!</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Thank you for contacting Sangli Ceramica. Our sales coordinator will reach out to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Full Name *
                    </label>
                    <input 
                      id="name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priyesh Shah"
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
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
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
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
                    placeholder="e.g. priyesh@gmail.com (Optional)"
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                    Your Message *
                  </label>
                  <textarea 
                    id="message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. I am looking for high-gloss marble-look vitrified tiles in size 800x1600mm. Do you have stock available, and what is the per sq ft pricing?"
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] resize-none"
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
                      Submitting Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Map Location */}
      <div className="h-96 w-full rounded-2xl overflow-hidden border border-[#27272a]/50 relative shadow-2xl">
        <iframe
          title="Google Map Showroom Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.5721111623826!2d74.58284561486835!3d16.847528388405086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x8e83b8b1a8d052b6!2sSangli%20Ceramica!5e0!3m2!1sen!2sin!4v1624000000000!5m2!1sen!2sin"
          className="absolute inset-0 w-full h-full border-0 grayscale invert contrast-125 opacity-70"
          allowFullScreen={false}
          loading="lazy"
        />
      </div>
    </div>
  );
}
