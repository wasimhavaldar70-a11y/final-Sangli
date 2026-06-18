'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Category } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (e: any) {
      setErrorMsg('Failed to load categories: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillSlug = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setSlug('');
    setImageUrl('');
    setDescription('');
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.image_url || '');
    setDescription(cat.description || '');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const catPayload = { name, slug, image_url: imageUrl, description };

    try {
      if (isDummy) {
        let updatedList = [...categories];
        if (editingId) {
          updatedList = updatedList.map(c => {
            if (c.id === editingId) return { ...c, ...catPayload };
            return c;
          });
          setSuccessMsg('Category updated in Local Cache.');
        } else {
          updatedList.unshift({
            id: 'c-' + Math.random().toString(),
            ...catPayload,
            created_at: new Date().toISOString()
          });
          setSuccessMsg('Category added to Local Cache.');
        }
        setCategories(updatedList);
        setIsEditing(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('categories').update(catPayload).eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('Category updated successfully.');
      } else {
        const { error } = await supabase.from('categories').insert([catPayload]);
        if (error) throw error;
        setSuccessMsg('Category added successfully.');
      }

      setIsEditing(false);
      loadCategories();
    } catch (e: any) {
      setErrorMsg('Failed to save category: ' + e.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All related products will be deleted too!')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updated = categories.filter(c => c.id !== id);
        setCategories(updated);
        setSuccessMsg('Category deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Category deleted successfully.');
      loadCategories();
    } catch (e: any) {
      setErrorMsg('Failed to delete category: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Showroom Categories
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Configure layout classifications for products catalog.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Category
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
        <form onSubmit={handleSaveCategory} className="glass-panel p-6 rounded-2xl border border-[#c5a880]/30 space-y-4">
          <h3 className="font-serif text-white font-bold text-sm">
            {editingId ? 'Modify Category' : 'Create Category'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleAutoFillSlug(e.target.value)}
                placeholder="e.g. Bathroom Tiles"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. bathroom-tiles"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of product styles in this category..."
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
              Save Category
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
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/50 flex flex-col justify-between"
            >
              <div className="aspect-[16/9] bg-[#1c1c1f] relative overflow-hidden">
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800'} 
                  alt="" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-bold text-white mb-2">{cat.name}</h3>
                <span className="text-[10px] text-[#c5a880] font-mono block mb-3">Slug: {cat.slug}</span>
                <p className="text-xs text-[#a1a1aa] line-clamp-3 leading-relaxed mb-6">
                  {cat.description}
                </p>
                <div className="flex gap-2 justify-end pt-4 border-t border-[#27272a]/50">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-[#c5a880] hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 bg-red-950/20 text-red-400 rounded-lg hover:bg-red-950/50 hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
