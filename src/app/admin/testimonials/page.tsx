'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Testimonial } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getTestimonials();
      setTestimonials(data);
    } catch (e: any) {
      setErrorMsg('Failed to load testimonials: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setDesignation('');
    setReview('');
    setRating(5);
    setImageUrl('');
  };

  const handleOpenEdit = (test: Testimonial) => {
    setIsEditing(true);
    setEditingId(test.id);
    setName(test.name);
    setDesignation(test.designation || '');
    setReview(test.review);
    setRating(test.rating);
    setImageUrl(test.image_url || '');
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = { name, designation, review, rating, image_url: imageUrl };

    try {
      if (isDummy) {
        let updatedList = [...testimonials];
        if (editingId) {
          updatedList = updatedList.map(test => {
            if (test.id === editingId) return { ...test, ...payload };
            return test;
          });
          setSuccessMsg('Review updated in Local Cache.');
        } else {
          updatedList.unshift({
            id: 't-' + Math.random().toString(),
            ...payload,
            created_at: new Date().toISOString()
          });
          setSuccessMsg('Review added to Local Cache.');
        }
        setTestimonials(updatedList);
        setIsEditing(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('Testimonial updated successfully.');
      } else {
        const { error } = await supabase.from('testimonials').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Testimonial added successfully.');
      }

      setIsEditing(false);
      loadTestimonials();
    } catch (e: any) {
      setErrorMsg('Failed to save review: ' + e.message);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updated = testimonials.filter(test => test.id !== id);
        setTestimonials(updated);
        setSuccessMsg('Review deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Testimonial deleted successfully.');
      loadTestimonials();
    } catch (e: any) {
      setErrorMsg('Failed to delete review: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Testimonials CMS
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Configure customer reviews displayed on the website.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Review
        </button>
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

      {/* Editor Panel */}
      {isEditing && (
        <form onSubmit={handleSaveTestimonial} className="glass-panel p-6 rounded-2xl border border-[#c5a880]/30 space-y-4">
          <h3 className="font-serif text-white font-bold text-sm">
            {editingId ? 'Modify Review' : 'Create Review'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suhas Mane"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Designation / Role</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Interior Designer"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Star Rating *</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">User Avatar / Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Review Content *</label>
            <textarea
              rows={4}
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did this client say about Sangli Ceramica's products, showroom guidance, or delivery times?"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2 rounded-lg"
            >
              Save Testimonial
            </button>
          </div>
        </form>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div 
              key={test.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c5a880] text-[#c5a880]" />
                  ))}
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed italic mb-6">
                  &ldquo;{test.review}&rdquo;
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-[#27272a]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1c1c1f]">
                    <img src={test.image_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.name}</h4>
                    <span className="text-[10px] text-[#c5a880]">{test.designation}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="p-1.5 bg-zinc-800 text-white rounded hover:bg-[#c5a880] hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteTestimonial(test.id)}
                    className="p-1.5 bg-red-950/20 text-red-400 rounded hover:bg-red-950/50 hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
