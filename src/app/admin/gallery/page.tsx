'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { GalleryItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Living Room');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getGalleryItems();
      setItems(data);
    } catch (e: any) {
      setErrorMsg('Failed to load gallery items: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setCategory('Living Room');
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setImageUrl(item.image_url);
    setCategory(item.category);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = { title, image_url: imageUrl, category };

    try {
      if (isDummy) {
        let updatedList = [...items];
        if (editingId) {
          updatedList = updatedList.map(item => {
            if (item.id === editingId) return { ...item, ...payload };
            return item;
          });
          setSuccessMsg('Gallery item updated in Local Cache.');
        } else {
          updatedList.unshift({
            id: 'g-' + Math.random().toString(),
            ...payload,
            created_at: new Date().toISOString()
          });
          setSuccessMsg('Gallery item added to Local Cache.');
        }
        setItems(updatedList);
        setIsEditing(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('gallery').update(payload).eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('Gallery item updated successfully.');
      } else {
        const { error } = await supabase.from('gallery').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Gallery item added successfully.');
      }

      setIsEditing(false);
      loadGallery();
    } catch (e: any) {
      setErrorMsg('Failed to save item: ' + e.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updated = items.filter(item => item.id !== id);
        setItems(updated);
        setSuccessMsg('Gallery item deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Gallery item deleted successfully.');
      loadGallery();
    } catch (e: any) {
      setErrorMsg('Failed to delete item: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Gallery CMS
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Configure layout concept mockups for the homepage and inspiration gallery.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Gallery Item
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
        <form onSubmit={handleSaveItem} className="glass-panel p-6 rounded-2xl border border-[#c5a880]/30 space-y-4">
          <h3 className="font-serif text-white font-bold text-sm">
            {editingId ? 'Modify Gallery Entry' : 'Create Gallery Entry'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Title / Label *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimalist Master Bathroom Design"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Category Concept *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              >
                <option value="Living Room">Living Room</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Image URL *</label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
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
              Save Entry
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
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/50 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-[#1c1c1f] relative overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt="" 
                  className="object-cover w-full h-full"
                />
                <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] uppercase font-bold text-[#c5a880] tracking-wider border border-[#c5a880]/20">
                  {item.category}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between gap-4">
                <h3 className="font-serif text-xs font-bold text-white truncate flex-grow">{item.title}</h3>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 bg-zinc-800 text-white rounded hover:bg-[#c5a880] hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
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
