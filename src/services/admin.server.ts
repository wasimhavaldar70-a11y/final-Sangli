'use server'

import { Inquiry, Appointment } from '@/types/database'
import { FALLBACK_INQUIRIES, FALLBACK_APPOINTMENTS } from './fallbackData'
import { isDbConfigured } from './api'
import { createClient } from '@/lib/supabase/server'

export async function getAllInquiries(): Promise<Inquiry[]> {
  if (!(await isDbConfigured())) return FALLBACK_INQUIRIES
  try {
    const supabase = await createClient()
    
    // In Supabase we use join: select('*, products(name, slug)')
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching inquiries:', error)
      return FALLBACK_INQUIRIES
    }

    return (data || []).map(doc => ({
      ...doc,
      products: Array.isArray(doc.products) ? doc.products[0] : doc.products
    })) as Inquiry[]
  } catch (error) {
    console.error('Failed to fetch inquiries server side from Supabase, using fallback:', error)
    return FALLBACK_INQUIRIES
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  if (!(await isDbConfigured())) return FALLBACK_APPOINTMENTS
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })

    if (error) {
      console.error('Supabase error fetching appointments:', error)
      return FALLBACK_APPOINTMENTS
    }

    return (data || []) as Appointment[]
  } catch (error) {
    console.error('Failed to fetch appointments server side from Supabase, using fallback:', error)
    return FALLBACK_APPOINTMENTS
  }
}
