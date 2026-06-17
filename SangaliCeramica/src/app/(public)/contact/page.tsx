'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, ContactFormInput } from '@/lib/validation/schemas'
import { submitContact } from '@/app/actions/formActions'
import { getSettings, getStores } from '@/services/api'
import { Settings, StoreLocation } from '@/types/database'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2, Sparkles, Map } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us & Showroom Locations | Sangli Ceramica',
  description: 'Get in touch with Sangli Ceramica. Find our showroom coordinates, direct phone numbers, and working hours for premium tile inquiries.',
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedStoreMap, setSelectedStoreMap] = useState<string>('')

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setSelectedStoreMap(s?.google_map || '')
    })
    getStores().then(setStores)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true)
    setSubmitResult(null)
    try {
      const response = await submitContact(data)
      if (response.success) {
        setSubmitResult({ success: true, message: response.message || 'Message sent!' })
        reset()
      } else {
        setSubmitResult({
          success: false,
          message: typeof response.error === 'string' ? response.error : 'Failed to send message.',
        })
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultWebsiteName = settings?.website_name || 'Sangli Ceramica'
  const defaultAddress = settings?.address || 'Sangli-Miraj Road, Vishrambag, Sangli, Maharashtra'
  const defaultPhone = settings?.phone || '+91 98765 43210'
  const defaultEmail = settings?.email || 'info@sangliceramica.com'

  const displayStores = stores.length > 0 ? stores : [{
    id: 'default',
    name: 'Main Showroom',
    address: defaultAddress,
    phone: defaultPhone,
    whatsapp: settings?.whatsapp || '',
    email: defaultEmail,
    google_map_url: settings?.google_map || '',
    created_at: new Date().toISOString()
  }]

  return (
    <div className="min-h-screen py-24 bg-zinc-950 space-y-16">
      
      {/* Title Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-accent/15 text-accent text-xs font-bold uppercase px-3 py-1 rounded-full border border-accent/20">
          <Sparkles className="h-3.5 w-3.5" /> Support Desk
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
          Get in Touch
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-light">
          Have an inquiry about sizing, catalogs, or custom builder deals? Reach out or visit our showroom.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info Details - 5 cols */}
        <div className="lg:col-span-5 space-y-8">
          
          {displayStores.map((store, index) => (
            <div key={store.id} className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-850 space-y-6 glass-panel relative group">
              <h2 className="text-xl font-bold text-white border-l-2 border-accent pl-3">
                {store.name}
              </h2>
              
              <button 
                onClick={() => setSelectedStoreMap(store.google_map_url)}
                className="absolute top-6 right-6 text-xs bg-zinc-800 hover:bg-accent text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Map className="h-3.5 w-3.5" /> View Map
              </button>

              <div className="space-y-6 text-sm">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Address</h4>
                    <p className="text-zinc-400 mt-1 leading-relaxed">{store.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Direct Phone</h4>
                    <p className="text-zinc-400 mt-1">{store.phone} {store.whatsapp ? `(WA: ${store.whatsapp})` : ''}</p>
                  </div>
                </div>

                {store.email && (
                  <div className="flex gap-4">
                    <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white">Email Enquiries</h4>
                      <p className="text-zinc-400 mt-1 break-all">{store.email}</p>
                    </div>
                  </div>
                )}
                
                {index === 0 && (
                  <div className="flex gap-4">
                    <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white">Working Hours</h4>
                      <p className="text-zinc-400 mt-1">Monday - Saturday: 09:30 AM - 08:30 PM</p>
                      <p className="text-zinc-550 mt-0.5 text-xs">Sunday: Closed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Embedded Google Map */}
          <div className="h-72 rounded-3xl overflow-hidden border border-zinc-850 shadow-xl bg-zinc-900">
            <iframe
              src={selectedStoreMap || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3817.9626359570183!2d74.603348!3d16.852923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x6b4fd4ef9c5f884f!2sSangli!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'}
              className="w-full h-full border-none grayscale invert contrast-[1.15]"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Map coordinates"
            ></iframe>
          </div>
        </div>

        {/* Contact Form - 7 cols */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-850 rounded-3xl p-8 md:p-10 shadow-2xl glass-panel flex flex-col justify-center">
          
          {submitResult?.success ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-white">Message Dispatched!</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                {submitResult.message} We will review your query and reply within 24 business hours.
              </p>
              <button
                onClick={() => setSubmitResult(null)}
                className="mt-6 inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-l-2 border-accent pl-3">
                Send an Instant Message
              </h2>

              {submitResult && !submitResult.success && (
                <div className="bg-red-900/15 border border-red-500/25 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {submitResult.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      {...register('customer_name')}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-accent focus:ring-1 focus:ring-accent text-white rounded-xl px-4 py-3.5 text-sm transition-all placeholder-zinc-700"
                    />
                    {errors.customer_name && (
                      <p className="text-xs text-red-500 font-semibold">{errors.customer_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-accent focus:ring-1 focus:ring-accent text-white rounded-xl px-4 py-3.5 text-sm transition-all placeholder-zinc-700"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 font-semibold">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Email Address <span className="text-zinc-650">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. info@example.com"
                    {...register('email')}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-accent focus:ring-1 focus:ring-accent text-white rounded-xl px-4 py-3.5 text-sm transition-all placeholder-zinc-700"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter your message or questions here..."
                    {...register('message')}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-accent focus:ring-1 focus:ring-accent text-white rounded-xl px-4 py-3.5 text-sm transition-all placeholder-zinc-700 resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 font-semibold">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-101 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
