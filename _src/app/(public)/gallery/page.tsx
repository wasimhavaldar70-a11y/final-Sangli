'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { GalleryItem } from '@/types';
import { Image as ImageIcon, Layers } from 'lucide-react';

const categories = ['All', 'Living Room', 'Bathroom', 'Kitchen', 'Outdoor'];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filtered, setFiltered] = useState<GalleryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      try {
        const data = await api.getGalleryItems();
        setItems(data);
        setFiltered(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCat(cat);
    if (cat === 'All') {
      setFiltered(items);
    } else {
      setFiltered(items.filter(item => item.category === cat));
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Design Gallery &amp; Inspiration</h1>
        <div className="w-16 h-1 bg-[#c5a880] mb-6 mx-auto sm:mx-0 rounded-full" />
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Get inspired by our collection of mockups and showroom concepts. See how different tile arrangements and sanitary options fit together.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-12 justify-center sm:justify-start">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`text-xs font-semibold px-5 py-2.5 rounded-full border transition-all ${
              selectedCat === cat 
                ? 'bg-[#c5a880] text-black border-[#c5a880] font-bold' 
                : 'bg-[#121214] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#71717a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="aspect-[4/3] rounded-2xl bg-[#121214] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
          <ImageIcon className="w-12 h-12 text-[#c5a880]/30 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">No gallery entries available for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#27272a]/50 shadow-2xl hover:border-[#c5a880]/30 transition-all duration-300"
            >
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10" />
              <div className="absolute bottom-6 left-6 right-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] bg-black/60 px-2.5 py-1 rounded-full border border-[#c5a880]/20 inline-block mb-2">
                  {item.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-white leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
