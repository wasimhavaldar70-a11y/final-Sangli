'use server'

import {
  Category,
  Product,
  Testimonial,
  GalleryItem,
  Project,
  Blog,
  Settings,
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
import { getDb, isMongoConfigured } from '@/lib/mongodb'
import { Db } from 'mongodb'

let isSeeded = false

// Auto-seed function to populate MongoDB with fallbackData on first run
async function ensureMongoSeeded(db: Db) {
  try {
    // 1. Seed settings
    const settingsCount = await db.collection('settings').countDocuments()
    if (settingsCount === 0) {
      const { id, ...rest } = FALLBACK_SETTINGS
      await db.collection('settings').insertOne({ _id: id || '00000000-0000-0000-0000-000000000000', ...rest } as any)
      console.log('Seeded settings collection in MongoDB')
    }

    // 2. Seed categories
    const categoriesCount = await db.collection('categories').countDocuments()
    if (categoriesCount === 0) {
      const categoriesToInsert = FALLBACK_CATEGORIES.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('categories').insertMany(categoriesToInsert as any)
      console.log('Seeded categories collection in MongoDB')
    }

    // 3. Seed products
    const productsCount = await db.collection('products').countDocuments()
    if (productsCount === 0) {
      const productsToInsert = FALLBACK_PRODUCTS.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('products').insertMany(productsToInsert as any)
      console.log('Seeded products collection in MongoDB')
    }

    // 4. Seed testimonials
    const testimonialsCount = await db.collection('testimonials').countDocuments()
    if (testimonialsCount === 0) {
      const testimonialsToInsert = FALLBACK_TESTIMONIALS.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('testimonials').insertMany(testimonialsToInsert as any)
      console.log('Seeded testimonials collection in MongoDB')
    }

    // 5. Seed gallery
    const galleryCount = await db.collection('gallery').countDocuments()
    if (galleryCount === 0) {
      const galleryToInsert = FALLBACK_GALLERY.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('gallery').insertMany(galleryToInsert as any)
      console.log('Seeded gallery collection in MongoDB')
    }

    // 6. Seed projects
    const projectsCount = await db.collection('projects').countDocuments()
    if (projectsCount === 0) {
      const projectsToInsert = FALLBACK_PROJECTS.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('projects').insertMany(projectsToInsert as any)
      console.log('Seeded projects collection in MongoDB')
    }

    // 7. Seed blogs
    const blogsCount = await db.collection('blogs').countDocuments()
    if (blogsCount === 0) {
      const blogsToInsert = FALLBACK_BLOGS.map(({ id, ...rest }) => ({ _id: id, ...rest }))
      await db.collection('blogs').insertMany(blogsToInsert as any)
      console.log('Seeded blogs collection in MongoDB')
    }
  } catch (error) {
    console.error('Failed to run MongoDB seed script:', error)
  }
}

async function getMongoDb() {
  const db = await getDb()
  if (!db) return null
  if (!isSeeded) {
    isSeeded = true
    try {
      await ensureMongoSeeded(db)
    } catch (e) {
      console.error('Auto-seeding MongoDB failed, will retry next call:', e)
      isSeeded = false
    }
  }
  return db
}

function normalizeDoc<T>(doc: any): T {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return {
    id: _id.toString(),
    ...rest,
  } as T
}

export async function isDbConfigured(): Promise<boolean> {
  return isMongoConfigured()
}

export async function getSettings(): Promise<Settings> {
  if (!(await isDbConfigured())) return FALLBACK_SETTINGS
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_SETTINGS
    const settings = await db.collection('settings').findOne({ _id: '00000000-0000-0000-0000-000000000000' } as any)
    if (!settings) return FALLBACK_SETTINGS
    return normalizeDoc<Settings>(settings)
  } catch (error) {
    console.error('Failed to fetch settings from MongoDB, using fallback:', error)
    return FALLBACK_SETTINGS
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!(await isDbConfigured())) return FALLBACK_CATEGORIES
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_CATEGORIES
    const docs = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
    return docs.map(doc => normalizeDoc<Category>(doc))
  } catch (error) {
    console.error('Failed to fetch categories from MongoDB, using fallback:', error)
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
    if (options?.featured) {
      items = items.filter((p) => p.featured)
    }
    if (options?.categorySlug) {
      const category = FALLBACK_CATEGORIES.find((c) => c.slug === options.categorySlug)
      if (category) {
        items = items.filter((p) => p.category_id === category.id)
      } else {
        items = []
      }
    }
    if (options?.query) {
      const q = options.query.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q)
      )
    }
    return {
      products: items.slice(offset, offset + limit),
      totalCount: items.length,
    }
  }

  try {
    const db = await getMongoDb()
    if (!db) throw new Error('MongoDB database not available')

    let filter: any = {}
    if (options?.featured) {
      filter.featured = true
    }

    if (options?.categorySlug) {
      const category = await db.collection('categories').findOne({ slug: options.categorySlug })
      if (category) {
        filter.category_id = category._id
      } else {
        return { products: [], totalCount: 0 }
      }
    }

    if (options?.query) {
      const regex = new RegExp(options.query, 'i')
      filter.$or = [
        { name: regex },
        { description: regex },
        { brand: regex },
      ]
    }

    const totalCount = await db.collection('products').countDocuments(filter)
    const docs = await db.collection('products')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    return {
      products: docs.map(doc => normalizeDoc<Product>(doc)),
      totalCount,
    }
  } catch (error) {
    console.error('Failed to fetch products from MongoDB, using fallback:', error)
    let items = [...FALLBACK_PRODUCTS]
    if (options?.featured) items = items.filter((p) => p.featured)
    if (options?.categorySlug) {
      const category = FALLBACK_CATEGORIES.find((c) => c.slug === options.categorySlug)
      if (category) items = items.filter((p) => p.category_id === category.id)
    }
    if (options?.query) {
      const q = options.query.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
    }
    return {
      products: items.slice(offset, offset + limit),
      totalCount: items.length,
    }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await isDbConfigured())) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null
  }
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null
    const product = await db.collection('products').findOne({ slug })
    if (!product) return null
    return normalizeDoc<Product>(product)
  } catch (error) {
    console.error(`Failed to fetch product ${slug} from MongoDB, using fallback:`, error)
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
    const db = await getMongoDb()
    if (!db) return FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId && p.id !== productId).slice(0, limit)
    const docs = await db.collection('products')
      .find({
        category_id: categoryId,
        _id: { $ne: productId } as any,
      })
      .limit(limit)
      .toArray()
    return docs.map(doc => normalizeDoc<Product>(doc))
  } catch (error) {
    console.error('Failed to fetch related products from MongoDB, using fallback:', error)
    return FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId && p.id !== productId).slice(0, limit)
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!(await isDbConfigured())) return FALLBACK_TESTIMONIALS
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_TESTIMONIALS
    const docs = await db.collection('testimonials').find({}).sort({ created_at: -1 }).toArray()
    return docs.map(doc => normalizeDoc<Testimonial>(doc))
  } catch (error) {
    console.error('Failed to fetch testimonials from MongoDB, using fallback:', error)
    return FALLBACK_TESTIMONIALS
  }
}

export async function getGalleryItems(category?: string): Promise<GalleryItem[]> {
  if (!(await isDbConfigured())) {
    if (category) return FALLBACK_GALLERY.filter((g) => g.category === category)
    return FALLBACK_GALLERY
  }
  try {
    const db = await getMongoDb()
    if (!db) {
      if (category) return FALLBACK_GALLERY.filter((g) => g.category === category)
      return FALLBACK_GALLERY
    }
    let filter: any = {}
    if (category) filter.category = category
    const docs = await db.collection('gallery').find(filter).sort({ created_at: -1 }).toArray()
    return docs.map(doc => normalizeDoc<GalleryItem>(doc))
  } catch (error) {
    console.error('Failed to fetch gallery from MongoDB, using fallback:', error)
    if (category) return FALLBACK_GALLERY.filter((g) => g.category === category)
    return FALLBACK_GALLERY
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!(await isDbConfigured())) return FALLBACK_PROJECTS
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_PROJECTS
    const docs = await db.collection('projects').find({}).sort({ created_at: -1 }).toArray()
    return docs.map(doc => normalizeDoc<Project>(doc))
  } catch (error) {
    console.error('Failed to fetch projects from MongoDB, using fallback:', error)
    return FALLBACK_PROJECTS
  }
}

export async function getBlogs(): Promise<Blog[]> {
  if (!(await isDbConfigured())) return FALLBACK_BLOGS
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_BLOGS
    const docs = await db.collection('blogs')
      .find({ published: true })
      .sort({ created_at: -1 })
      .toArray()
    return docs.map(doc => normalizeDoc<Blog>(doc))
  } catch (error) {
    console.error('Failed to fetch blogs from MongoDB, using fallback:', error)
    return FALLBACK_BLOGS
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (!(await isDbConfigured())) {
    return FALLBACK_BLOGS.find((b) => b.slug === slug) || null
  }
  try {
    const db = await getMongoDb()
    if (!db) return FALLBACK_BLOGS.find((b) => b.slug === slug) || null
    const blog = await db.collection('blogs').findOne({ slug })
    if (!blog) return null
    return normalizeDoc<Blog>(blog)
  } catch (error) {
    console.error(`Failed to fetch blog ${slug} from MongoDB, using fallback:`, error)
    return FALLBACK_BLOGS.find((b) => b.slug === slug) || null
  }
}
