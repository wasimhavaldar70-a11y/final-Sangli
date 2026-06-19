'use server'

import {
  Category,
  Product,
  Testimonial,
  GalleryItem,
  Project,
  Blog,
  Settings,
  StoreLocation
} from '@/types/database'
import {
  FALLBACK_SETTINGS,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_TESTIMONIALS,
  FALLBACK_GALLERY,
  FALLBACK_PROJECTS,
  FALLBACK_BLOGS,
} from './fallbackData'
import { createClient } from '@/lib/supabase/server'

export async function isDbConfigured(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder')
}

export async function getSettings(): Promise<Settings> {
  if (!(await isDbConfigured())) return FALLBACK_SETTINGS
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('settings').select('*').limit(1).single()
    if (error || !data) return FALLBACK_SETTINGS
    return data as Settings
  } catch (error) {
    console.error('Failed to fetch settings from Supabase, using fallback:', error)
    return FALLBACK_SETTINGS
  }
}

export async function getStores(): Promise<StoreLocation[]> {
  if (!(await isDbConfigured())) return []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
    if (error) return []
    return data as StoreLocation[]
  } catch (error) {
    console.error('Failed to fetch stores from Supabase:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!(await isDbConfigured())) return FALLBACK_CATEGORIES
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (error || !data) return FALLBACK_CATEGORIES
    return data as Category[]
  } catch (error) {
    console.error('Failed to fetch categories from Supabase, using fallback:', error)
    return FALLBACK_CATEGORIES
  }
}

export async function getProducts(options?: {
  categorySlug?: string
  query?: string
  featured?: boolean
  page?: number
  limit?: number
}): Promise<{ products: Product[]; totalCount: number }> {
  const page = options?.page || 1
  const limit = options?.limit || 12
  const offset = (page - 1) * limit

  if (!(await isDbConfigured())) {
    let items = [...FALLBACK_PRODUCTS]
    if (options?.featured) items = items.filter((p) => p.featured)
    if (options?.categorySlug) {
      const category = FALLBACK_CATEGORIES.find((c) => c.slug === options.categorySlug)
      if (category) items = items.filter((p) => p.category_id === category.id)
      else items = []
    }
    if (options?.query) {
      const q = options.query.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      )
    }
    return {
      products: items.slice(offset, offset + limit),
      totalCount: items.length,
    }
  }

  try {
    const supabase = await createClient()
    let query = supabase.from('products').select('*, product_images(*)', { count: 'exact' })

    if (options?.featured) {
      query = query.eq('featured', true)
    }

    if (options?.categorySlug) {
      const { data: category } = await supabase.from('categories').select('id').eq('slug', options.categorySlug).single()
      if (category) {
        query = query.eq('category_id', category.id)
      } else {
        return { products: [], totalCount: 0 }
      }
    }

    if (options?.query) {
      query = query.or(`name.ilike.%${options.query}%,description.ilike.%${options.query}%,brand.ilike.%${options.query}%`)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      products: (data || []) as Product[],
      totalCount: count || 0,
    }
  } catch (error) {
    console.error('Failed to fetch products from Supabase, using fallback:', error)
    return { products: [], totalCount: 0 }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await isDbConfigured())) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('products').select('*, product_images(*)').eq('slug', slug).single()
    if (error || !data) return null
    return data as Product
  } catch (error) {
    console.error(`Failed to fetch product ${slug} from Supabase, using fallback:`, error)
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null
  }
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<Product[]> {
  if (!(await isDbConfigured())) {
    return FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId && p.id !== productId).slice(0, limit)
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('products')
      .select('*, product_images(*)')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit)
    if (error) return []
    return data as Product[]
  } catch (error) {
    console.error('Failed to fetch related products from Supabase, using fallback:', error)
    return FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId && p.id !== productId).slice(0, limit)
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!(await isDbConfigured())) return FALLBACK_TESTIMONIALS
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    if (error) return FALLBACK_TESTIMONIALS
    return data as Testimonial[]
  } catch (error) {
    console.error('Failed to fetch testimonials from Supabase, using fallback:', error)
    return FALLBACK_TESTIMONIALS
  }
}

export async function getGalleryItems(category?: string): Promise<GalleryItem[]> {
  if (!(await isDbConfigured())) {
    if (category) return FALLBACK_GALLERY.filter((g) => g.category === category)
    return FALLBACK_GALLERY
  }
  try {
    const supabase = await createClient()
    let query = supabase.from('gallery').select('*').order('created_at', { ascending: false })
    if (category) query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return data as GalleryItem[]
  } catch (error) {
    console.error('Failed to fetch gallery from Supabase, using fallback:', error)
    if (category) return FALLBACK_GALLERY.filter((g) => g.category === category)
    return FALLBACK_GALLERY
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!(await isDbConfigured())) return FALLBACK_PROJECTS
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error) return FALLBACK_PROJECTS
    return data as Project[]
  } catch (error) {
    console.error('Failed to fetch projects from Supabase, using fallback:', error)
    return FALLBACK_PROJECTS
  }
}

export async function getBlogs(): Promise<Blog[]> {
  if (!(await isDbConfigured())) return FALLBACK_BLOGS
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false })
    if (error) return FALLBACK_BLOGS
    return data as Blog[]
  } catch (error) {
    console.error('Failed to fetch blogs from Supabase, using fallback:', error)
    return FALLBACK_BLOGS
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (!(await isDbConfigured())) {
    return FALLBACK_BLOGS.find((b) => b.slug === slug) || null
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single()
    if (error) return null
    return data as Blog
  } catch (error) {
    console.error(`Failed to fetch blog ${slug} from Supabase, using fallback:`, error)
    return FALLBACK_BLOGS.find((b) => b.slug === slug) || null
  }
}
