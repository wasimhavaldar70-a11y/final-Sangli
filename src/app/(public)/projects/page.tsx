'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Project } from '@/types';
import { MapPin, Briefcase } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Our Reference Projects</h1>
        <div className="w-16 h-1 bg-[#c5a880] mb-6 mx-auto sm:mx-0 rounded-full" />
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Explore a selection of residential bungalows, corporate towers, and penthouses fitted with materials and components supplied by Sangli Ceramica.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-96 rounded-2xl bg-[#121214] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
          <Briefcase className="w-12 h-12 text-[#c5a880]/30 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">No reference projects uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <div 
              key={proj.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/45 shadow-xl hover:border-[#c5a880]/20 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1c1f]">
                <img 
                  src={proj.image_url || '/images/placeholder.jpg'} 
                  alt={proj.title} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#c5a880] tracking-wider border border-[#c5a880]/20 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#c5a880]" />
                  {proj.location}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white mb-3">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-4 mb-6">
                    {proj.description}
                  </p>
                </div>
                <div className="text-xs text-[#c5a880] font-bold pt-4 border-t border-[#27272a]/50">
                  Fitted with Sangli Ceramica Collections
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
