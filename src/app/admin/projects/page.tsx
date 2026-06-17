'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Project } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e: any) {
      setErrorMsg('Failed to load projects: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
  };

  const handleOpenEdit = (proj: Project) => {
    setIsEditing(true);
    setEditingId(proj.id);
    setTitle(proj.title);
    setDescription(proj.description || '');
    setLocation(proj.location || '');
    setImageUrl(proj.image_url || '');
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = { title, description, location, image_url: imageUrl };

    try {
      if (isDummy) {
        let updatedList = [...projects];
        if (editingId) {
          updatedList = updatedList.map(proj => {
            if (proj.id === editingId) return { ...proj, ...payload };
            return proj;
          });
          setSuccessMsg('Project updated in Local Cache.');
        } else {
          updatedList.unshift({
            id: 'pr-' + Math.random().toString(),
            ...payload,
            created_at: new Date().toISOString()
          });
          setSuccessMsg('Project added to Local Cache.');
        }
        setProjects(updatedList);
        setIsEditing(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
        setSuccessMsg('Project updated successfully.');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Project added successfully.');
      }

      setIsEditing(false);
      loadProjects();
    } catch (e: any) {
      setErrorMsg('Failed to save project: ' + e.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reference project?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updated = projects.filter(proj => proj.id !== id);
        setProjects(updated);
        setSuccessMsg('Project deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Project deleted successfully.');
      loadProjects();
    } catch (e: any) {
      setErrorMsg('Failed to delete project: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Projects CMS
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Configure completed residential/commercial reference installations.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
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
        <form onSubmit={handleSaveProject} className="glass-panel p-6 rounded-2xl border border-[#c5a880]/30 space-y-4">
          <h3 className="font-serif text-white font-bold text-sm">
            {editingId ? 'Modify Project Entry' : 'Create Project Entry'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Royal Villa"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Location / Area *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vishrambag, Sangli"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
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
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Project Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what tiles, mixers, or fittings were supplied and how the spaces were configured..."
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
              Save Project
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
          {projects.map((proj) => (
            <div 
              key={proj.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/50 flex flex-col justify-between"
            >
              <div className="aspect-[16/9] bg-[#1c1c1f] relative overflow-hidden">
                <img 
                  src={proj.image_url || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800'} 
                  alt="" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <span className="text-[10px] text-[#c5a880] font-bold block mb-1">Location: {proj.location}</span>
                <h3 className="font-serif text-base font-bold text-white mb-2">{proj.title}</h3>
                <p className="text-xs text-[#a1a1aa] line-clamp-3 leading-relaxed mb-6">
                  {proj.description}
                </p>
                <div className="flex gap-2 justify-end pt-4 border-t border-[#27272a]/50">
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-[#c5a880] hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
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
