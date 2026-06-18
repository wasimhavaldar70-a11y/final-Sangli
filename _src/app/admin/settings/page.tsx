'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Settings as SettingsType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Settings, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getSettings();
      setSettings(data);
      setName(data.website_name);
      setLogo(data.logo || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setWhatsapp(data.whatsapp || '');
      setMapUrl(data.google_map || '');
    } catch (e: any) {
      setErrorMsg('Failed to load settings: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      website_name: name,
      logo,
      address,
      phone,
      email,
      whatsapp,
      google_map: mapUrl
    };

    try {
      if (isDummy) {
        setSuccessMsg('Settings updated in Local Cache successfully.');
        setSaveLoading(false);
        return;
      }

      if (settings?.id) {
        const { error } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([payload]);
        
        if (error) throw error;
      }

      setSuccessMsg('Website settings saved successfully.');
      loadSettings();
    } catch (e: any) {
      setErrorMsg('Failed to save settings: ' + e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
          Global Settings
        </h1>
        <p className="text-xs text-[#a1a1aa] mt-1">Configure showroom address, coordinates, hours, and branding.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 space-y-6 shadow-xl">
        <h3 className="font-serif text-white font-bold text-sm border-b border-[#27272a] pb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#c5a880]" />
          Configure Global Showroom Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Showroom Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sangli Ceramica"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Showroom Logo Path / URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="e.g. /images/logo.png"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Support Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">WhatsApp Channel Number</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Official Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. info@sangliceramica.com"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Showroom Location Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123, Luxury Showroom Lane, Sangli"
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Google Maps Embed iframe URL</label>
          <textarea
            rows={3}
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#27272a]/50">
          <button
            type="submit"
            disabled={saveLoading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-6 py-3 rounded-lg transition-all"
          >
            {saveLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Settings Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
