'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Blog } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (e: any) {
      setErrorMsg('Failed to load articles: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillSlug = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle('');
    setSlug('');
    setImageUrl('');
    setContent('');
    setPublished(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setIsEditing(true);
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setImageUrl(blog.featured_image || '');
    setContent(blog.content);
    setPublished(blog.published);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = { title, slug, featured_image: imageUrl, content, published };

    try {
      if (isDummy) {
        let updatedList = [...blogs];
        if (editingId) {
          updatedList = updatedList.map(b => {
            if (b.id === editingId) return { ...b, ...payload };
            return b;
          });
          setSuccessMsg('Article updated in Local Cache.');
        } else {
          updatedList.unshift({
            id: 'b-' + Math.random().toString(),
            ...payload,
            created_at: new Date().toISOString()
          });
          setSuccessMsg('Article added to Local Cache.');
        }
        setBlogs(updatedList);
        setIsEditing(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('Article updated successfully.');
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Article published successfully.');
      }

      setIsEditing(false);
      loadBlogs();
    } catch (e: any) {
      setErrorMsg('Failed to save article: ' + e.message);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updated = blogs.filter(b => b.id !== id);
        setBlogs(updated);
        setSuccessMsg('Article deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Article deleted successfully.');
      loadBlogs();
    } catch (e: any) {
      setErrorMsg('Failed to delete article: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Blogs CMS
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Configure layout, tiles guide, and design trend articles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Write Article
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
        <form onSubmit={handleSaveBlog} className="glass-panel p-6 rounded-2xl border border-[#c5a880]/30 space-y-4">
          <h3 className="font-serif text-white font-bold text-sm">
            {editingId ? 'Modify Blog Article' : 'Create Blog Article'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleAutoFillSlug(e.target.value)}
                placeholder="e.g. 5 Trending Bathroom Designs in 2026"
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
                placeholder="e.g. 5-trending-bathroom-designs-2026"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Featured Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#121214] text-[#c5a880] focus:ring-0"
              />
              <label htmlFor="published" className="text-xs font-semibold text-white cursor-pointer select-none">
                Publish immediately (Publicly visible)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Article Body Content *</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full editorial text. Separate paragraphs using double line breaks..."
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
              Save Article
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/50 flex flex-col justify-between"
            >
              <div className="aspect-[21/9] bg-[#1c1c1f] relative overflow-hidden">
                <img 
                  src={blog.featured_image || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800'} 
                  alt="" 
                  className="object-cover w-full h-full"
                />
                <span className={`absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                  blog.published 
                    ? 'bg-green-950/70 border-green-800 text-green-400' 
                    : 'bg-zinc-800 border-zinc-700 text-[#a1a1aa]'
                }`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-bold text-white mb-2 leading-tight">{blog.title}</h3>
                <span className="text-[10px] text-[#c5a880] font-mono block mb-3">Slug: {blog.slug}</span>
                <p className="text-xs text-[#a1a1aa] line-clamp-3 leading-relaxed mb-6">
                  {blog.content}
                </p>
                <div className="flex gap-2 justify-end pt-4 border-t border-[#27272a]/50">
                  <button
                    onClick={() => handleOpenEdit(blog)}
                    className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-[#c5a880] hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
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
