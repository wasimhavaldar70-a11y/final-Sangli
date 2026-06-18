'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Blog } from '@/types';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const data = await api.getBlogs();
        setBlogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Design Trends &amp; Guides</h1>
        <div className="w-16 h-1 bg-[#c5a880] mb-6 mx-auto sm:mx-0 rounded-full" />
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Learn expert tips on selecting the right tiles, configuring bathroom layouts, and combining faucet materials for your home interiors.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(n => (
            <div key={n} className="h-96 rounded-2xl bg-[#121214] animate-pulse" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
          <BookOpen className="w-12 h-12 text-[#c5a880]/30 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">No articles published at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/45 shadow-xl hover:border-[#c5a880]/20 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#1c1c1f]">
                <img 
                  src={blog.featured_image || '/images/placeholder.jpg'} 
                  alt={blog.title} 
                  className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-[#a1a1aa] font-semibold uppercase tracking-wider mb-3">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#c5a880] transition-colors leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3 mb-6">
                    {blog.content}
                  </p>
                </div>
                <Link 
                  href={`/blogs/${blog.slug}`}
                  className="inline-flex items-center gap-2 text-xs text-[#c5a880] font-bold group-hover:text-white transition-colors mt-auto"
                >
                  Read Full Article
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
