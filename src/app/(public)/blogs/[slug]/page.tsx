'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Blog } from '@/types';
import { ArrowLeft, Calendar, User, Clock, AlertCircle } from 'lucide-react';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      try {
        const data = await api.getBlogBySlug(slug);
        setBlog(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-2">Article Not Found</h1>
        <p className="text-sm text-[#a1a1aa] mb-8">The blog article you are looking for does not exist or has been removed.</p>
        <Link 
          href="/blogs"
          className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-6 py-3 rounded-full hover:shadow-lg transition-all"
        >
          ← Return to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link 
          href="/blogs"
          className="inline-flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Blogs
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-4 items-center text-xs text-[#a1a1aa] font-semibold uppercase tracking-wider mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
            {new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#c5a880]" />
            By Showroom Expert
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
            3 Min Read
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          {blog.title}
        </h1>
      </header>

      {/* Featured Image */}
      {blog.featured_image && (
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#27272a]/50 mb-12 shadow-2xl bg-[#121214]">
          <img 
            src={blog.featured_image} 
            alt={blog.title} 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none text-[#d4d4d8] text-sm sm:text-base leading-relaxed space-y-6 mb-16">
        {blog.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Related Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-1">Want to explore these collections?</h4>
          <p className="text-xs text-[#a1a1aa]">Schedule a visit to see our active displays in the showroom.</p>
        </div>
        <Link
          href="/appointments"
          className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-6 py-3 rounded-full hover:shadow-lg transition-all shrink-0"
        >
          Book Showroom Visit
        </Link>
      </div>
    </div>
  );
}
