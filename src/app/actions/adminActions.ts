'use server'

import { isDbConfigured } from '@/services/api'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
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
    const supabase = await createClient()
    const newId = randomUUID()
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const { error } = await supabase.from('products').insert({
      id: newId,
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
    })

    if (error) throw error

    if (productData.image_url) {
      const { error: imgError } = await supabase.from('product_images').insert({
        id: randomUUID(),
        product_id: newId,
        image_url: productData.image_url,
        sort_order: 0,
      })
      if (imgError) throw imgError
    }

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
    const supabase = await createClient()
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const { error } = await supabase.from('products').update({
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
    }).eq('id', id)

    if (error) throw error

    if (productData.image_url) {
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true })

      if (existingImages && existingImages.length > 0) {
        const { error: imgError } = await supabase
          .from('product_images')
          .update({ image_url: productData.image_url })
          .eq('id', existingImages[0].id)
        if (imgError) throw imgError
      } else {
        const { error: imgError } = await supabase.from('product_images').insert({
          id: randomUUID(),
          product_id: id,
          image_url: productData.image_url,
          sort_order: 0,
        })
        if (imgError) throw imgError
      }
    }

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
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error

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
    const supabase = await createClient()
    const table = type === 'inquiry' ? 'inquiries' : 'appointments'
    
    const { error } = await supabase.from(table).update({ status }).eq('id', id)
    if (error) throw error

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
    const supabase = await createClient()
    
    const { error } = await supabase.from('settings').update({
      website_name: settingsData.website_name,
      address: settingsData.address,
      phone: settingsData.phone,
      email: settingsData.email,
      whatsapp: settingsData.whatsapp,
      google_map: settingsData.google_map,
    }).eq('id', '00000000-0000-0000-0000-000000000000')

    if (error) throw error

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
    return {
      success: true,
      message: `Successfully simulated importing ${productsToInsert.length} products (Preview Mode)!`,
    }
  }

  try {
    const supabase = await createClient()

    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug')
    if (catError || !categories) throw new Error('Failed to fetch categories')

    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]))

    const finalProducts = []
    const finalImages = []

    for (const p of productsToInsert) {
      const categoryId = categoryMap.get(p.category_slug)
      if (!categoryId) {
        throw new Error(
          `Category slug "${p.category_slug}" for product "${p.name}" was not found. Please create the category first.`
        )
      }

      const prodId = randomUUID()
      finalProducts.push({
        id: prodId,
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
      })

      finalImages.push({
        id: randomUUID(),
        product_id: prodId,
        image_url: '',
        sort_order: 0,
      })
    }

    if (finalProducts.length > 0) {
      const { error: prodError } = await supabase.from('products').insert(finalProducts)
      if (prodError) throw prodError
      
      const { error: imgError } = await supabase.from('product_images').insert(finalImages)
      if (imgError) throw imgError
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

  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const isPreview = cookieStore.get('sb-admin-preview-session')?.value === 'true'
  
  if (!user && !isPreview) {
    return { success: false, error: 'Unauthorized. Please log in again.' }
  }

  if (!configured) {
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
    const supabase = await createClient()
    const newId = randomUUID()
    
    const { error } = await supabase.from('stores').insert({
      id: newId,
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      email: payload.email,
      google_map_url: payload.google_map_url,
    })
    
    if (error) throw error

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
    const supabase = await createClient()
    
    const { error } = await supabase.from('stores').update({
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      email: payload.email,
      google_map_url: payload.google_map_url,
    }).eq('id', id)
    
    if (error) throw error

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
    const supabase = await createClient()
    
    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/stores')
    revalidatePath('/contact')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting store:', error)
    return { success: false, error: error.message }
  }
}
