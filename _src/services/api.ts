import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { 
  Category, Product, Testimonial, GalleryItem, 
  Project, Blog, Settings, Inquiry, Appointment 
} from '@/types';

// Check if we are using the dummy URL
const isDummySupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url.includes('dummy-project') || !url;
};

// --- STATIC FALLBACK SEED DATA ---
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Floor Tiles',
    slug: 'floor-tiles',
    image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
    description: 'Premium vitrified and glazed floor tiles for home and office spaces.',
    created_at: new Date().toISOString()
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Wall Tiles',
    slug: 'wall-tiles',
    image_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800',
    description: 'Designer wall tiles in matte, glossy, and textured finishes for kitchens and bathrooms.',
    created_at: new Date().toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Sanitary Ware',
    slug: 'sanitary-ware',
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant water closets, washbasins, and cabinets for modern bathrooms.',
    created_at: new Date().toISOString()
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Bath Fittings & Faucets',
    slug: 'bath-fittings-faucets',
    image_url: 'https://images.unsplash.com/photo-1620626011761-996317b69763?auto=format&fit=crop&q=80&w=800',
    description: 'Luxury faucets, shower systems, and bathroom accessories.',
    created_at: new Date().toISOString()
  }
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Royal Statuario Vitrified',
    slug: 'royal-statuario-vitrified',
    description: 'Premium Statuario Italian marble-look glazed vitrified floor tiles with high gloss finish. Brings a classic, regal elegance to living rooms and entrance halls.',
    price: 125.00,
    brand: 'Kajaria',
    size: '800x1600 mm',
    finish: 'High Gloss',
    material: 'Vitrified',
    stock_status: 'in_stock',
    featured: true,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[0],
    product_images: [
      { id: 'img1', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' },
      { id: 'img2', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800', sort_order: 2, created_at: '' }
    ]
  },
  {
    id: 'p1111111-1111-1111-1111-222222222222',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Obsidian Black Matt',
    slug: 'obsidian-black-matt',
    description: 'Deep charcoal black double charge vitrified tiles, anti-skid and heavy duty, perfect for commercial spaces and modern outdoor patios.',
    price: 95.00,
    brand: 'Somany',
    size: '600x1200 mm',
    finish: 'Matte',
    material: 'Double Charge Vitrified',
    stock_status: 'in_stock',
    featured: false,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[0],
    product_images: [
      { id: 'img3', product_id: 'p2', image_url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }
    ]
  },
  {
    id: 'p1111111-1111-1111-1111-333333333333',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Rustic Oak Wood Planks',
    slug: 'rustic-oak-wood-planks',
    description: 'Natural wooden plank feel porcelain tiles with high-definition wood grain texture. Offers the durability of porcelain with the warmth and aesthetics of natural wood.',
    price: 110.00,
    brand: 'Nerolac Ceramica',
    size: '200x1200 mm',
    finish: 'Matte / Textured',
    material: 'Porcelain',
    stock_status: 'in_stock',
    featured: true,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[0],
    product_images: [
      { id: 'img4', product_id: 'p3', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }
    ]
  },
  {
    id: 'p2222222-2222-2222-2222-111111111111',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Carrara Gold Highlighter',
    slug: 'carrara-gold-highlighter',
    description: 'Luxury ceramic wall tiles featuring elegant gold veins. Ideal for kitchen splashbacks, fireplace backdrops, and accent bathroom walls.',
    price: 85.00,
    brand: 'Kajaria',
    size: '300x600 mm',
    finish: 'Glossy',
    material: 'Ceramic',
    stock_status: 'in_stock',
    featured: true,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[1],
    product_images: [
      { id: 'img5', product_id: 'p4', image_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }
    ]
  },
  {
    id: 'p3333333-3333-3333-3333-111111111111',
    category_id: 'c3333333-3333-3333-3333-222222222222',
    name: 'Velvet One-Piece Closet',
    slug: 'velvet-one-piece-water-closet',
    description: 'Luxury rimless one-piece toilet with soft close seat, anti-bacterial glazing, and dual tornado flush mechanism.',
    price: 14500.00,
    brand: 'Jaquar',
    size: 'Standard',
    finish: 'Premium Glaze White',
    material: 'Ceramic',
    stock_status: 'in_stock',
    featured: true,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[2],
    product_images: [
      { id: 'img6', product_id: 'p5', image_url: 'https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }
    ]
  },
  {
    id: 'p4444444-4444-4444-4444-111111111111',
    category_id: 'c4444444-4444-4444-4444-222222222222',
    name: 'Rose Gold Basin Mixer',
    slug: 'rose-gold-basin-mixer',
    description: 'Tallboy single-lever bathroom basin mixer in premium PVD rose gold coating. Provides a stunning aesthetic to under-counter washbasins.',
    price: 6500.00,
    brand: 'Jaquar',
    size: 'Tallboy',
    finish: 'PVD Rose Gold',
    material: 'Brass',
    stock_status: 'in_stock',
    featured: true,
    created_at: new Date().toISOString(),
    categories: FALLBACK_CATEGORIES[3],
    product_images: [
      { id: 'img7', product_id: 'p6', image_url: 'https://images.unsplash.com/photo-1620626011761-996317b69763?auto=format&fit=crop&q=80&w=800', sort_order: 1, created_at: '' }
    ]
  }
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Amit Deshmukh',
    designation: 'Architect & Interior Designer',
    review: 'Sangli Ceramica has an outstanding range of tiles. Their Statuario collection was the perfect choice for my client\'s luxury villa in Sangli. Highly professional staff!',
    rating: 5,
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    created_at: ''
  },
  {
    id: 't2',
    name: 'Priya Shah',
    designation: 'Home Owner',
    review: 'We got our entire bathroom fittings and tiles from here. The thermostatic shower and rose gold mixers look premium and work flawlessly. Excellent guidance by their team!',
    rating: 5,
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    created_at: ''
  },
  {
    id: 't3',
    name: 'Rahul Patil',
    designation: 'Builder, Patil Constructions',
    review: 'Reliable pricing, genuine brands, and consistent supply. For all our projects in Western Maharashtra, Sangli Ceramica is our go-to showroom.',
    rating: 5,
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    created_at: ''
  }
];

const FALLBACK_GALLERY: GalleryItem[] = [
  { id: 'g1', title: 'Luxury Living Room with Statuario Tiles', image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', category: 'Living Room', created_at: '' },
  { id: 'g2', title: 'Modern Master Bathroom with Rose Gold Accents', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800', category: 'Bathroom', created_at: '' },
  { id: 'g3', title: 'Minimalist Kitchen Splashback Design', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', category: 'Kitchen', created_at: '' },
  { id: 'g4', title: 'Outdoor Deck with Wood Planks', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', category: 'Outdoor', created_at: '' }
];

const FALLBACK_PROJECTS: Project[] = [
  { id: 'pr1', title: 'The Royal Villa', description: 'Full flooring and bathroom fittings for a 5BHK luxury bungalow using Italian marble tiles and premium Jaquar fittings.', location: 'Sangli Road, Miraj', image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800', created_at: '' },
  { id: 'pr2', title: 'Emerald Corporate Tower', description: 'Commercial double charge vitrified flooring and premium sanitary wares across 6 floors.', location: 'Vishrambag, Sangli', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', created_at: '' },
  { id: 'pr3', title: 'Skyline Penthouse', description: 'Custom porcelain planks deck and open-terrace tiles installation with rustic finishing.', location: 'Kupwad, Sangli', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', created_at: '' }
];

const FALLBACK_BLOGS: Blog[] = [
  {
    id: 'b1',
    title: 'How to Choose the Perfect Floor Tile for Your Living Room',
    slug: 'how-to-choose-floor-tile-living-room',
    content: 'Choosing the right flooring is a crucial decision when designing your home. Vitrified tiles offer durability and ease of maintenance. For a spacious, premium look, consider larger sizes like 800x1600 mm. Glossy finishes reflect light beautifully and make spaces look larger, while satin matte finishes provide a modern, subtle underfoot experience. Ensure that the tiles are load-tested and match the overall color scheme of your furniture.',
    featured_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
    published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'b2',
    title: '5 Trending Bathroom Designs in 2026',
    slug: '5-trending-bathroom-designs-2026',
    content: 'From PVD gold and black matte faucet coatings to rimless water closets and natural stone tiles, discover what design elements are transforming bathrooms this year. Modern homeowners are prioritizing wellness, shifting towards rain-showers, thermostatic mixers, and table-top washbasins. Wood-look tiles are also making their way inside showers, giving a natural spa-like vibe without the water-damage risk of real timber.',
    featured_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    published: true,
    created_at: new Date().toISOString()
  }
];

const FALLBACK_SETTINGS: Settings = {
  id: 's1',
  website_name: 'Sangli Ceramica',
  logo: '/images/logo.png',
  address: '123, Luxury Showroom Lane, Near Sangli Bypass, Sangli, Maharashtra 416416, India',
  phone: '+91 98765 43210',
  email: 'info@sangliceramica.com',
  whatsapp: '+91 98765 43210',
  google_map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.5721111623826!2d74.58284561486835!3d16.847528388405086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x8e83b8b1a8d052b6!2sSangli%20Ceramica!5e0!3m2!1sen!2sin!4v1624000000000!5m2!1sen!2sin',
  created_at: ''
};

// Local storage mocks for lead collections in fallback mode
let fallbackInquiries: any[] = [];
let fallbackAppointments: any[] = [];

// --- API SERVICES IMPLEMENTATION ---
export const api = {
  async getCategories(): Promise<Category[]> {
    if (isDummySupabase()) return FALLBACK_CATEGORIES;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase fetch failed, utilizing fallback data.', e);
      return FALLBACK_CATEGORIES;
    }
  },

  async getProducts(filters?: { categorySlug?: string; featuredOnly?: boolean; search?: string }): Promise<Product[]> {
    if (isDummySupabase()) {
      let filtered = [...FALLBACK_PRODUCTS];
      if (filters?.featuredOnly) {
        filtered = filtered.filter(p => p.featured);
      }
      if (filters?.categorySlug) {
        filtered = filtered.filter(p => p.categories?.slug === filters.categorySlug);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
      }
      return filtered;
    }

    try {
      const supabase = createBrowserClient();
      let query = supabase.from('products').select('*, categories(*), product_images(*)');
      
      if (filters?.featuredOnly) {
        query = query.eq('featured', true);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      let products = (data as any[]) || [];

      // Manual filtering for categorySlug because joined categories select is complex to filter in JS SDK
      if (filters?.categorySlug) {
        products = products.filter(p => p.categories?.slug === filters.categorySlug);
      }

      return products;
    } catch (e) {
      console.warn('Supabase fetch products failed, using fallback.', e);
      let filtered = [...FALLBACK_PRODUCTS];
      if (filters?.featuredOnly) filtered = filtered.filter(p => p.featured);
      if (filters?.categorySlug) filtered = filtered.filter(p => p.categories?.slug === filters.categorySlug);
      return filtered;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isDummySupabase()) {
      return FALLBACK_PRODUCTS.find(p => p.slug === slug) || null;
    }
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      return FALLBACK_PRODUCTS.find(p => p.slug === slug) || null;
    }
  },

  async getRelatedProducts(productId: string, categoryId: string): Promise<Product[]> {
    if (isDummySupabase()) {
      return FALLBACK_PRODUCTS.filter(p => p.category_id === categoryId && p.id !== productId).slice(0, 3);
    }
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .limit(3);
      if (error) throw error;
      return data || [];
    } catch (e) {
      return FALLBACK_PRODUCTS.filter(p => p.category_id === categoryId && p.id !== productId).slice(0, 3);
    }
  },

  async getGalleryItems(): Promise<GalleryItem[]> {
    if (isDummySupabase()) return FALLBACK_GALLERY;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return FALLBACK_GALLERY;
    }
  },

  async getProjects(): Promise<Project[]> {
    if (isDummySupabase()) return FALLBACK_PROJECTS;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return FALLBACK_PROJECTS;
    }
  },

  async getTestimonials(): Promise<Testimonial[]> {
    if (isDummySupabase()) return FALLBACK_TESTIMONIALS;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return FALLBACK_TESTIMONIALS;
    }
  },

  async getBlogs(): Promise<Blog[]> {
    if (isDummySupabase()) return FALLBACK_BLOGS;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return FALLBACK_BLOGS;
    }
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    if (isDummySupabase()) {
      return FALLBACK_BLOGS.find(b => b.slug === slug) || null;
    }
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return FALLBACK_BLOGS.find(b => b.slug === slug) || null;
    }
  },

  async getSettings(): Promise<Settings> {
    if (isDummySupabase()) return FALLBACK_SETTINGS;
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) throw error;
      return data || FALLBACK_SETTINGS;
    } catch (e) {
      return FALLBACK_SETTINGS;
    }
  },

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'created_at'>): Promise<boolean> {
    if (isDummySupabase()) {
      const newInquiry = {
        ...inquiry,
        id: Math.random().toString(),
        status: 'new',
        created_at: new Date().toISOString()
      };
      fallbackInquiries.push(newInquiry);
      // Save to local storage for persistence across reloads
      if (typeof window !== 'undefined') {
        localStorage.setItem('fallback_inquiries', JSON.stringify(fallbackInquiries));
      }
      return true;
    }
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('inquiries').insert([inquiry]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Inquiry submission failed', e);
      return false;
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<boolean> {
    if (isDummySupabase()) {
      const newAppointment = {
        ...appointment,
        id: Math.random().toString(),
        status: 'new',
        created_at: new Date().toISOString()
      };
      fallbackAppointments.push(newAppointment);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fallback_appointments', JSON.stringify(fallbackAppointments));
      }
      return true;
    }
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('appointments').insert([appointment]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Appointment booking failed', e);
      return false;
    }
  }
};
