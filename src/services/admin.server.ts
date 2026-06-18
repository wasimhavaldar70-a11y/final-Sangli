'use server'

import { Inquiry, Appointment } from '@/types/database'
import { FALLBACK_INQUIRIES, FALLBACK_APPOINTMENTS } from './fallbackData'
import { isDbConfigured } from './api'
import { getDb } from '@/lib/mongodb'

function normalizeDoc<T>(doc: any): T {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return {
    id: _id.toString(),
    ...rest,
  } as T
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (!(await isDbConfigured())) return FALLBACK_INQUIRIES
  try {
    const db = await getDb()
    if (!db) return FALLBACK_INQUIRIES
    
    // In MongoDB we can perform lookup to join products if needed, 
    // but since product_id is stored in inquiries, we can resolve it manually or keep it simple.
    // Let's do a simple lookup aggregation to fetch product info:
    const docs = await db.collection('inquiries')
      .aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product_info',
          }
        },
        {
          $addFields: {
            products: {
              $cond: {
                if: { $gt: [{ $size: '$product_info' }, 0] },
                then: {
                  name: { $arrayElemAt: ['$product_info.name', 0] },
                  slug: { $arrayElemAt: ['$product_info.slug', 0] },
                },
                else: null,
              }
            }
          }
        },
        {
          $project: {
            product_info: 0,
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ])
      .toArray()

    return docs.map(doc => normalizeDoc<Inquiry>(doc))
  } catch (error) {
    console.error('Failed to fetch inquiries server side from MongoDB, using fallback:', error)
    return FALLBACK_INQUIRIES
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  if (!(await isDbConfigured())) return FALLBACK_APPOINTMENTS
  try {
    const db = await getDb()
    if (!db) return FALLBACK_APPOINTMENTS
    const docs = await db.collection('appointments')
      .find({})
      .sort({ appointment_date: 1 })
      .toArray()
    return docs.map(doc => normalizeDoc<Appointment>(doc))
  } catch (error) {
    console.error('Failed to fetch appointments server side from MongoDB, using fallback:', error)
    return FALLBACK_APPOINTMENTS
  }
}
