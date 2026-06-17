'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Category, Product } from '@/types';
import { Search, Filter, RefreshCw, Layers } from 'lucide-react';

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = searchParams.get('category') || '';
  const selectedSearch = searchParams.get('search') || '';

  // Sync state with url search param
  useEffect(() => {
    setSearchTerm(selectedSearch);
  }, [selectedSearch]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (e) {
        console.error(e);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const prods = await api.getProducts({
          categorySlug: selectedCategory || undefined,
          search: selectedSearch || undefined
        });
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [selectedCategory, selectedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push('/products');
  };

  return (
    <div className="bg-[#09090b] min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">Our Products Catalog</h1>
        <div className="w-16 h-1 bg-[#c5a880] mb-6 mx-auto sm:mx-0 rounded-full" />
        <p className="text-sm text-[#a1a1aa] max-w-xl">
          Browse through our premium collections of vitrified tiles, designer ceramics, bath mixers, washbasins, and accessories.
        </p>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left column - filters */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-serif text-white font-bold text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#c5a880]" />
                Filter by Category
              </span>
              {(selectedCategory || selectedSearch) && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs text-[#c5a880] hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Categories filters list */}
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                  !selectedCategory 
                    ? 'bg-[#c5a880] text-black' 
                    : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Categories
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full text-left text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-[#c5a880] text-black font-bold' 
                        : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column - product grid */}
        <div className="lg:col-span-9 space-y-8">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or details..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
              />
              <Search className="w-4 h-4 text-[#71717a] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] hover:from-[#e8d09f] hover:to-[#c5a880] text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-[#121214] border border-[#27272a]/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-[#27272a]/50">
              <p className="text-[#a1a1aa] mb-4">No products found matching your active filters.</p>
              <button 
                onClick={clearFilters}
                className="text-xs text-[#c5a880] border border-[#c5a880]/30 hover:border-[#c5a880] px-4 py-2 rounded-full transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="group bg-[#121214] rounded-2xl overflow-hidden border border-[#27272a]/45 shadow-xl hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1c1f]">
                    <img
                      src={prod.product_images?.[0]?.image_url || '/images/placeholder.jpg'}
                      alt={prod.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#c5a880] tracking-widest border border-[#c5a880]/20">
                      {prod.brand}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[10px] text-[#c5a880] font-bold uppercase tracking-wider mb-1">
                      {prod.categories?.name}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#c5a880] transition-colors mb-2">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mb-4 line-clamp-2 flex-grow">
                      {prod.description}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-[#27272a]/50 mt-auto">
                      <span className="text-[#c5a880] font-semibold text-sm">
                        {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : 'Contact for Quote'}
                      </span>
                      <span className="text-xs text-[#a1a1aa]">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    }>
      <ProductsCatalog />
    </Suspense>
  );
}
