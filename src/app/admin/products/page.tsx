'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Category, Product } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, Edit2, Trash2, Upload, FileText, CheckCircle2, 
  AlertCircle, Star, Sparkles, Check, X, ShieldAlert 
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formFinish, setFormFinish] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formStock, setFormStock] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // CSV Bulk Import states
  const [csvContent, setCsvContent] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);

  const supabase = createClient();
  const isDummy = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);
      setCategories(cats);
      
      // Load products (checking local storage updates first if in dummy mode)
      if (isDummy && typeof window !== 'undefined') {
        const stored = localStorage.getItem('fallback_products');
        if (stored) {
          setProducts(JSON.parse(stored));
          setLoading(false);
          return;
        }
      }
      setProducts(prods);
    } catch (e: any) {
      setErrorMsg('Failed to load products: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugAutoFill = (nameVal: string) => {
    setFormName(nameVal);
    setFormSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormCategoryId(categories[0]?.id || '');
    setFormDescription('');
    setFormPrice('');
    setFormBrand('');
    setFormSize('');
    setFormFinish('');
    setFormMaterial('');
    setFormStock('in_stock');
    setFormFeatured(false);
    setFormImageUrl('');
  };

  const handleOpenEdit = (prod: Product) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setFormName(prod.name);
    setFormSlug(prod.slug);
    setFormCategoryId(prod.category_id);
    setFormDescription(prod.description || '');
    setFormPrice(prod.price?.toString() || '');
    setFormBrand(prod.brand || '');
    setFormSize(prod.size || '');
    setFormFinish(prod.finish || '');
    setFormMaterial(prod.material || '');
    setFormStock(prod.stock_status);
    setFormFeatured(prod.featured);
    setFormImageUrl(prod.product_images?.[0]?.image_url || '');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const priceNum = parseFloat(formPrice);
    
    const productPayload = {
      category_id: formCategoryId,
      name: formName,
      slug: formSlug,
      description: formDescription,
      price: isNaN(priceNum) ? undefined : priceNum,
      brand: formBrand,
      size: formSize,
      finish: formFinish,
      material: formMaterial,
      stock_status: formStock,
      featured: formFeatured
    };

    try {
      if (isDummy) {
        // Fallback Client implementation
        let updatedList = [...products];
        const selectedCatObj = categories.find(c => c.id === formCategoryId);
        
        if (editingId) {
          // Edit
          updatedList = updatedList.map(p => {
            if (p.id === editingId) {
              return {
                ...p,
                ...productPayload,
                categories: selectedCatObj,
                product_images: [{ id: 'img', product_id: p.id, image_url: formImageUrl || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }]
              };
            }
            return p;
          });
          setSuccessMsg('Product details updated successfully in Local Cache.');
        } else {
          // Create
          const newId = 'p-' + Math.random().toString();
          const newProduct: Product = {
            id: newId,
            ...productPayload,
            created_at: new Date().toISOString(),
            categories: selectedCatObj,
            product_images: [{ id: 'img', product_id: newId, image_url: formImageUrl || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }]
          };
          updatedList.unshift(newProduct);
          setSuccessMsg('Product added successfully to Local Cache.');
        }
        setProducts(updatedList);
        localStorage.setItem('fallback_products', JSON.stringify(updatedList));
        setIsEditing(false);
        return;
      }

      // Supabase Implementation
      if (editingId) {
        // Update product table
        const { error: prodErr } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingId);

        if (prodErr) throw prodErr;

        // Update main image url reference in product_images
        if (formImageUrl) {
          // Delete old images and insert new one
          await supabase.from('product_images').delete().eq('product_id', editingId);
          await supabase.from('product_images').insert([{ product_id: editingId, image_url: formImageUrl }]);
        }
        setSuccessMsg('Product updated successfully.');
      } else {
        // Insert product table
        const { data: insertedProduct, error: prodErr } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();

        if (prodErr) throw prodErr;

        // Insert main image url reference
        if (formImageUrl && insertedProduct) {
          await supabase.from('product_images').insert([{ product_id: insertedProduct.id, image_url: formImageUrl }]);
        }
        setSuccessMsg('Product added successfully.');
      }

      setIsEditing(false);
      loadData();
    } catch (e: any) {
      setErrorMsg('Failed to save product: ' + e.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isDummy) {
        const updatedList = products.filter(p => p.id !== id);
        setProducts(updatedList);
        localStorage.setItem('fallback_products', JSON.stringify(updatedList));
        setSuccessMsg('Product deleted from Local Cache.');
        return;
      }

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('Product deleted successfully.');
      loadData();
    } catch (e: any) {
      setErrorMsg('Failed to delete product: ' + e.message);
    }
  };

  const handleBulkImport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!csvContent) {
      setErrorMsg('Please paste CSV contents first.');
      return;
    }

    try {
      const lines = csvContent.split('\n');
      const header = lines[0].split(',');
      const importedProducts: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple comma split
        const values = line.split(',');
        
        const nameVal = values[0]?.trim();
        const slugVal = values[1]?.trim() || nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const categorySlug = values[2]?.trim();
        const priceVal = parseFloat(values[3]?.trim());
        const brandVal = values[4]?.trim();
        const sizeVal = values[5]?.trim();
        const finishVal = values[6]?.trim();
        const materialVal = values[7]?.trim();
        const descVal = values[8]?.trim() || '';
        const imgVal = values[9]?.trim() || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800';

        const categoryObj = categories.find(c => c.slug === categorySlug) || categories[0];
        
        if (!nameVal || !categoryObj) continue;

        importedProducts.push({
          category_id: categoryObj.id,
          name: nameVal,
          slug: slugVal,
          description: descVal,
          price: isNaN(priceVal) ? undefined : priceVal,
          brand: brandVal,
          size: sizeVal,
          finish: finishVal,
          material: materialVal,
          stock_status: 'in_stock',
          featured: false,
          image_url: imgVal
        });
      }

      if (importedProducts.length === 0) {
        throw new Error('No valid products parsed from CSV.');
      }

      if (isDummy) {
        let updatedList = [...products];
        importedProducts.forEach(prod => {
          const newId = 'p-' + Math.random().toString();
          updatedList.unshift({
            id: newId,
            category_id: prod.category_id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            price: prod.price,
            brand: prod.brand,
            size: prod.size,
            finish: prod.finish,
            material: prod.material,
            stock_status: 'in_stock',
            featured: false,
            created_at: new Date().toISOString(),
            categories: categories.find(c => c.id === prod.category_id),
            product_images: [{ id: 'img', product_id: newId, image_url: prod.image_url, sort_order: 1, created_at: '' }]
          });
        });
        setProducts(updatedList);
        localStorage.setItem('fallback_products', JSON.stringify(updatedList));
        setSuccessMsg(`Successfully imported ${importedProducts.length} products to Local Cache.`);
        setShowCsvImport(false);
        setCsvContent('');
        return;
      }

      // Supabase Bulk Import
      for (const prod of importedProducts) {
        const { image_url, ...prodPayload } = prod;
        const { data: inserted, error: insErr } = await supabase
          .from('products')
          .insert([prodPayload])
          .select()
          .single();

        if (insErr) {
          console.error(insErr);
          continue;
        }

        if (image_url && inserted) {
          await supabase.from('product_images').insert([{ product_id: inserted.id, image_url }]);
        }
      }

      setSuccessMsg(`Successfully imported products.`);
      setShowCsvImport(false);
      setCsvContent('');
      loadData();
    } catch (e: any) {
      setErrorMsg('Bulk Import failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            Products Directory
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">Add, edit, feature, and delete showroom products.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="inline-flex items-center gap-2 bg-[#121214] border border-[#27272a] hover:border-[#c5a880]/30 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk CSV Import
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Product
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-950/40 border border-green-800/40 text-green-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* CSV Bulk Import Panel */}
      {showCsvImport && (
        <div className="glass-panel p-6 rounded-2xl border border-[#27272a]/50 shadow-xl space-y-4">
          <h3 className="text-white font-serif font-bold text-sm">Bulk Upload Products via CSV</h3>
          <p className="text-[10px] text-[#a1a1aa] leading-relaxed">
            Format: <code className="bg-[#121214] px-1 py-0.5 border border-[#27272a] rounded">Name,Slug,CategorySlug,Price,Brand,Size,Finish,Material,Description,ImageUrl</code>. <br />
            Include one product per line. Ensure that CategorySlug exactly matches an existing category slug (e.g., floor-tiles).
          </p>
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={6}
            placeholder="Royal Statuario Vitrified,royal-statuario-vitrified,floor-tiles,125.00,Kajaria,800x1600 mm,High Gloss,Vitrified,Premium Vitrified Tiles,https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCsvImport(false)}
              className="bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-4 py-2 rounded-lg"
            >
              Parse &amp; Import
            </button>
          </div>
        </div>
      )}

      {/* Product Creator/Editor Form modal */}
      {isEditing && (
        <form onSubmit={handleSaveProduct} className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#c5a880]/30 shadow-2xl space-y-6">
          <h3 className="font-serif text-white font-bold text-lg border-b border-[#27272a] pb-4">
            {editingId ? 'Modify Product Details' : 'Add New Showroom Product'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => handleSlugAutoFill(e.target.value)}
                placeholder="e.g. Royal Statuario Vitrified"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Product URL Slug *</label>
              <input
                type="text"
                required
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. royal-statuario-vitrified"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Category *</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Brand / Manufacturer</label>
              <input
                type="text"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Kajaria, Jaquar"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Estimate Pricing (INR)</label>
              <input
                type="number"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 125.00"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Dimensions (Size)</label>
              <input
                type="text"
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                placeholder="e.g. 800x1600 mm"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Surface Finish</label>
              <input
                type="text"
                value={formFinish}
                onChange={(e) => setFormFinish(e.target.value)}
                placeholder="e.g. High Gloss, Satin Matt"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Material Type</label>
              <input
                type="text"
                value={formMaterial}
                onChange={(e) => setFormMaterial(e.target.value)}
                placeholder="e.g. Vitrified, Brass"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Stock Availability</label>
              <select
                value={formStock}
                onChange={(e) => setFormStock(e.target.value as any)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="featured"
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#121214] text-[#c5a880] focus:ring-0"
              />
              <label htmlFor="featured" className="text-xs font-semibold text-white cursor-pointer select-none">
                Feature on Homepage
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Main Product Image URL</label>
            <input
              type="text"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Product Description</label>
            <textarea
              rows={4}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide a detailed description of the design and architectural use of the product..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a880] resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-zinc-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-bold text-xs px-5 py-2.5 rounded-lg"
            >
              Save Product Data
            </button>
          </div>
        </form>
      )}

      {/* Products list grid table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#121214] text-[#a1a1aa] border-b border-[#27272a]/50">
                  <th className="p-4 font-bold">Image</th>
                  <th className="p-4 font-bold">Product Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Brand</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Stock Status</th>
                  <th className="p-4 font-bold">Featured</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]/40">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#121214]/25 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1c1c1f]">
                        <img 
                          src={prod.product_images?.[0]?.image_url || '/images/placeholder.jpg'} 
                          alt="" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">{prod.name}</td>
                    <td className="p-4 text-[#a1a1aa]">{prod.categories?.name}</td>
                    <td className="p-4 text-[#a1a1aa]">{prod.brand}</td>
                    <td className="p-4 text-white">
                      {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                        prod.stock_status === 'in_stock'
                          ? 'bg-green-950/40 text-green-400 border border-green-800/40'
                          : prod.stock_status === 'low_stock'
                          ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40'
                          : 'bg-red-950/40 text-red-400 border border-red-800/40'
                      }`}>
                        {prod.stock_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {prod.featured ? (
                        <Star className="w-4 h-4 fill-[#c5a880] text-[#c5a880]" />
                      ) : (
                        <Star className="w-4 h-4 text-zinc-700" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-[#c5a880] hover:text-black transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 bg-red-950/20 text-red-400 rounded-lg hover:bg-red-950/50 hover:text-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
