export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  brand?: string;
  size?: string;
  finish?: string;
  material?: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  featured: boolean;
  created_at: string;
  categories?: Category; // Joined category
  product_images?: ProductImage[]; // Joined images
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  product_id?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved' | 'cancelled';
  created_at: string;
  products?: {
    name: string;
    slug: string;
  };
}

export interface Appointment {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  appointment_date: string;
  message?: string;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  designation?: string;
  review: string;
  rating: number;
  image_url?: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  location?: string;
  image_url?: string;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image?: string;
  published: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  website_name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  google_map?: string;
  created_at: string;
}
