'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Product, ProductImage } from '@/types';
import { 
  ArrowLeft, MessageSquare, Mail, Send, Loader2, 
  CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck 
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Inquiry form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prod = await api.getProductBySlug(slug);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);
        if (prod.product_images && prod.product_images.length > 0) {
          setActiveImage(prod.product_images[0].image_url);
        }
        const rel = await api.getRelatedProducts(prod.id, prod.category_id);
        setRelated(rel);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const success = await api.createInquiry({
        customer_name: name,
        phone,
        email: email || undefined,
        product_id: product.id,
        message: message || `Interested in inquiring about: ${product.name}`
      });

      if (success) {
        setSubmitSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Something went wrong. Please check details and try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-2">Product Not Found</h1>
        <p className="text-sm text-[#a1a1aa] mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link 
          href="/products"
          className="bg-gradient-to-r from-[#c5a880] to-[#b5956a] text-black font-semibold text-xs px-6 py-3 rounded-full hover:shadow-lg transition-all"
        >
          ← Return to Catalog
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Sangli Ceramica, I am interested in the following product from your website:\n\n*Product:* ${product.name}\n*Brand:* ${product.brand || 'N/A'}\n*Size:* ${product.size || 'N/A'}\n\nPlease share price estimate and availability.`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  return (
    <div className="bg-[#09090b] min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back link */}
      <div className="mb-8">
        <Link 
          href="/products"
          className="inline-flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#27272a]/50 bg-[#121214]">
            <img 
              src={activeImage || '/images/placeholder.jpg'} 
              alt={product.name} 
              className="object-cover w-full h-full"
            />
          </div>
          
          {/* Thumbnails */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.product_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border shrink-0 transition-colors ${
                    activeImage === img.image_url ? 'border-[#c5a880]' : 'border-[#27272a]/60 hover:border-[#71717a]'
                  }`}
                >
                  <img src={img.image_url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Specs */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-xs text-[#c5a880] font-bold uppercase tracking-wider block mb-1">
              {product.categories?.name}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="bg-[#121214] border border-[#27272a] text-[#a1a1aa] text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                product.stock_status === 'in_stock' 
                  ? 'bg-green-950/45 border border-green-800/40 text-green-400' 
                  : 'bg-yellow-950/45 border border-yellow-800/40 text-yellow-400'
              }`}>
                {product.stock_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Table */}
          <div className="glass-panel rounded-2xl border border-[#27272a]/50 overflow-hidden">
            <div className="p-4 bg-[#121214] border-b border-[#27272a]/50 text-white font-serif font-bold text-sm">
              Product Specifications
            </div>
            <div className="divide-y divide-[#27272a]/50 text-xs">
              {product.size && (
                <div className="flex p-4">
                  <span className="w-1/3 text-[#a1a1aa] font-semibold">Dimensions</span>
                  <span className="w-2/3 text-white">{product.size}</span>
                </div>
              )}
              {product.finish && (
                <div className="flex p-4">
                  <span className="w-1/3 text-[#a1a1aa] font-semibold">Surface Finish</span>
                  <span className="w-2/3 text-white">{product.finish}</span>
                </div>
              )}
              {product.material && (
                <div className="flex p-4">
                  <span className="w-1/3 text-[#a1a1aa] font-semibold">Material</span>
                  <span className="w-2/3 text-white">{product.material}</span>
                </div>
              )}
              <div className="flex p-4">
                <span className="w-1/3 text-[#a1a1aa] font-semibold">Authenticity</span>
                <span className="w-2/3 text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                  Original Brand Warranty
                </span>
              </div>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              Inquire via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Form & Related Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-2xl border border-[#27272a]/50 shadow-xl relative">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Request Pricing &amp; Details</h3>
            <p className="text-xs text-[#a1a1aa] mb-6">Leave your contact details and our team will call or email you with availability estimates.</p>

            {submitSuccess ? (
              <div className="p-6 bg-green-950/45 border border-green-800/40 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-white font-bold text-base mb-1">Inquiry Submitted</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Thank you! Your request has been received. Our sales representatives will reach out to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {submitError && (
                  <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs rounded-lg">
                    {submitError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Full Name *
                    </label>
                    <input 
                      id="name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amit Deshmukh"
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                      Phone Number *
                    </label>
                    <input 
                      id="phone"
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                    Email Address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amit@designer.com (Optional)"
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
                    Special Requirements
                  </label>
                  <textarea 
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Quantity needed, customized color preference, home delivery address etc..."
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-gradient-to-r from-[#c5a880] to-[#b5956a] hover:from-[#e8d09f] hover:to-[#c5a880] text-black font-semibold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Related Products */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-serif text-xl font-bold text-white mb-4">Related Collections</h3>
          {related.length === 0 ? (
            <p className="text-xs text-[#a1a1aa]">No related items in this category at this time.</p>
          ) : (
            <div className="space-y-4">
              {related.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="flex gap-4 p-3 bg-[#121214] hover:bg-[#1c1c1f] rounded-xl border border-[#27272a]/50 transition-colors group"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#1c1c1f]">
                    <img 
                      src={prod.product_images?.[0]?.image_url || '/images/placeholder.jpg'} 
                      alt="" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] text-[#c5a880] font-bold uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#c5a880] transition-colors line-clamp-1">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-[#a1a1aa] mt-1">
                      {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : 'Contact for Quote'}
                    </span>
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
