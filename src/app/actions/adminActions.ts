'use server'

import { isDbConfigured } from '@/services/api'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/mongodb'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { StoreLocation } from '@/types/database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function adminLogin(formData: any) {
  const email = (formData.email || '').trim()
  const password = (formData.password || '').trim()

  const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@sangliceramica.com').trim()
  const expectedPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim()

  // Master Override: Allow the environment variables to always bypass Supabase,
  // PLUS a hardcoded failsafe in case Netlify environment variables are misconfigured.
  const isEnvMatch = email === expectedEmail && password === expectedPassword
  const isHardcodedMatch = email === 'admin@sangliceramica.com' && password === 'admin123'

  if (isEnvMatch || isHardcodedMatch) {
    const cookieStore = await cookies()
    cookieStore.set('sb-admin-preview-session', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })
    return { success: true, message: 'Successfully logged in.' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
    // Live Supabase Authentication
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, message: 'Successfully logged in.' }
  }

  return {
    success: false,
    error: 'Invalid administrator email or password.',
  }
}

export async function adminLogout() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  
  const cookieStore = await cookies()
  cookieStore.delete('sb-admin-preview-session')
  return { success: true }
}

export async function createProductAction(productData: any) {
  const configured = await isDbConfigured()
  if (!configured) {
    return {
      success: true,
      message: 'Product created successfully (Simulation in Preview Mode)!',
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    const newId = randomUUID()
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const productImages = productData.image_url
      ? [
          {
            id: randomUUID(),
            product_id: newId,
            image_url: productData.image_url,
            sort_order: 0,
            created_at: new Date().toISOString(),
          },
        ]
      : []

    await db.collection('products').insertOne({
      _id: newId,
      category_id: productData.category_id,
      name: productData.name,
      slug,
      description: productData.description || null,
      price: parseFloat(productData.price) || 0,
      brand: productData.brand,
      size: productData.size || null,
      finish: productData.finish || null,
      material: productData.material || null,
      stock_status: productData.stock_status || 'In Stock',
      featured: !!productData.featured,
      product_images: productImages,
      created_at: new Date().toISOString(),
    } as any)

    revalidatePath('/products')
    return { success: true, message: 'Product created successfully!' }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Failed to create product.' }
  }
}

export async function updateProductAction(id: string, productData: any) {
  const configured = await isDbConfigured()
  if (!configured) {
    return {
      success: true,
      message: 'Product updated successfully (Simulation in Preview Mode)!',
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const existing = await db.collection('products').findOne({ _id: id } as any)
    let productImages = existing?.product_images || []

    if (productData.image_url) {
      if (productImages.length > 0) {
        productImages[0].image_url = productData.image_url
      } else {
        productImages = [
          {
            id: randomUUID(),
            product_id: id,
            image_url: productData.image_url,
            sort_order: 0,
            created_at: new Date().toISOString(),
          },
        ]
      }
    }

    await db.collection('products').updateOne(
      { _id: id } as any,
      {
        $set: {
          category_id: productData.category_id,
          name: productData.name,
          slug,
          description: productData.description || null,
          price: parseFloat(productData.price) || 0,
          brand: productData.brand,
          size: productData.size || null,
          finish: productData.finish || null,
          material: productData.material || null,
          stock_status: productData.stock_status || 'In Stock',
          featured: !!productData.featured,
          product_images: productImages,
        },
      }
    )

    revalidatePath(`/products/${slug}`)
    revalidatePath('/products')
    return { success: true, message: 'Product updated successfully!' }
  } catch (error: any) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Failed to update product.' }
  }
}

export async function deleteProductAction(id: string) {
  const configured = await isDbConfigured()
  if (!configured) {
    return {
      success: true,
      message: 'Product deleted successfully (Simulation in Preview Mode)!',
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    await db.collection('products').deleteOne({ _id: id } as any)

    revalidatePath('/products')
    return { success: true, message: 'Product deleted successfully!' }
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message || 'Failed to delete product.' }
  }
}

export async function updateLeadStatusAction(
  id: string,
  type: 'inquiry' | 'appointment',
  status: string
) {
  const configured = await isDbConfigured()
  if (!configured) {
    return {
      success: true,
      message: 'Lead status updated (Simulation in Preview Mode)!',
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    const collectionName = type === 'inquiry' ? 'inquiries' : 'appointments'
    await db.collection(collectionName).updateOne(
      { _id: id } as any,
      { $set: { status } }
    )

    return { success: true, message: 'Lead status updated successfully!' }
  } catch (error: any) {
    console.error('Error updating lead status:', error)
    return { success: false, error: error.message || 'Failed to update lead status.' }
  }
}

export async function updateSettingsAction(settingsData: any) {
  const configured = await isDbConfigured()
  if (!configured) {
    return {
      success: true,
      message: 'Settings saved successfully (Simulation in Preview Mode)!',
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    await db.collection('settings').updateOne(
      { _id: '00000000-0000-0000-0000-000000000000' } as any,
      {
        $set: {
          website_name: settingsData.website_name,
          address: settingsData.address,
          phone: settingsData.phone,
          email: settingsData.email,
          whatsapp: settingsData.whatsapp,
          google_map: settingsData.google_map,
        },
      }
    )

    return { success: true, message: 'Website settings updated successfully!' }
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return { success: false, error: error.message || 'Failed to update settings.' }
  }
}

export async function bulkUploadProductsCSV(csvText: string) {
  const parseCSVLine = (line: string) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const lines = csvText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return { success: false, error: 'CSV must contain header and at least one product row.' }
  }

  const headers = parseCSVLine(lines[0])
  const productsToInsert = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < headers.length) continue

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    productsToInsert.push(row)
  }

  const configured = await isDbConfigured()
  if (!configured) {
    console.log('Bulk Upload Simulation:', productsToInsert)
    return {
      success: true,
      message: `Successfully simulated importing ${productsToInsert.length} products (Preview Mode)!`,
    }
  }

  try {
    const db = await getDb()
    if (!db) throw new Error('MongoDB database not available')

    const categories = await db.collection('categories').find({}).toArray()
    const categoryMap = new Map(categories.map((c) => [c.slug, c._id.toString()]))

    const finalProducts = []
    for (const p of productsToInsert) {
      const categoryId = categoryMap.get(p.category_slug)
      if (!categoryId) {
        throw new Error(
          `Category slug "${p.category_slug}" for product "${p.name}" was not found. Please create the category first.`
        )
      }

      const prodId = randomUUID()
      finalProducts.push({
        _id: prodId,
        category_id: categoryId,
        name: p.name,
        slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: p.description || null,
        price: parseFloat(p.price) || 0,
        brand: p.brand || 'Premium Brand',
        size: p.size || 'Standard',
        finish: p.finish || 'Polished',
        material: p.material || 'Vitrified',
        stock_status: p.stock_status || 'In Stock',
        featured: p.featured === 'true' || p.featured === '1',
        product_images: [
          {
            id: randomUUID(),
            product_id: prodId,
            image_url: '',
            sort_order: 0,
            created_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
      })
    }

    if (finalProducts.length > 0) {
      await db.collection('products').insertMany(finalProducts as any)
    }

    revalidatePath('/products')
    return { success: true, message: `Successfully imported ${finalProducts.length} products!` }
  } catch (error: any) {
    console.error('Bulk upload error:', error)
    return { success: false, error: error.message || 'Failed to bulk import products.' }
  }
}

// ----------------------------------------------------------------------------
// IMAGE UPLOAD (Server-Side)
// ----------------------------------------------------------------------------
export async function uploadProductImageAction(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  const configured = await isDbConfigured()
  const supabase = await createClient()

  // Verify the user is authenticated on the server
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const isPreview = cookieStore.get('sb-admin-preview-session')?.value === 'true'
  
  if (!user && !isPreview) {
    return { success: false, error: 'Unauthorized. Please log in again.' }
  }

  if (!configured || (!user && isPreview)) {
    // Fallback: Save file locally in public/uploads
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      await writeFile(join(uploadDir, fileName), buffer)
      
      return { 
        success: true, 
        url: `/uploads/${fileName}` 
      }
    } catch (err) {
      console.error('Local upload error', err)
      return { success: false, error: 'Failed to upload locally.' }
    }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Ensure this file uses the arrayBuffer since standard Node.js fetch inside Supabase handles arrayBuffer better than raw File objects in some Next.js environments
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (error) {
    return { success: false, error: error.message }
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return { success: true, url: publicUrlData.publicUrl }
}

export async function createStoreAction(payload: Omit<StoreLocation, 'id' | 'created_at'>) {
  try {
    const db = await getDb()
    if (!db) throw new Error('Database not configured')

    const newId = randomUUID()
    const store: StoreLocation = {
      ...payload,
      id: newId,
      created_at: new Date().toISOString(),
    }

    await db.collection('stores').insertOne(store)
    revalidatePath('/admin/stores')
    revalidatePath('/contact')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating store:', error)
    return { success: false, error: error.message }
  }
}

export async function updateStoreAction(id: string, payload: Partial<StoreLocation>) {
  try {
    const db = await getDb()
    if (!db) throw new Error('Database not configured')

    await db.collection('stores').updateOne({ id }, { $set: payload })
    revalidatePath('/admin/stores')
    revalidatePath('/contact')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating store:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteStoreAction(id: string) {
  try {
    const db = await getDb()
    if (!db) throw new Error('Database not configured')

    await db.collection('stores').deleteOne({ id })
    revalidatePath('/admin/stores')
    revalidatePath('/contact')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting store:', error)
    return { success: false, error: error.message }
  }
}
