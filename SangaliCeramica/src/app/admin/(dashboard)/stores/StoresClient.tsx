'use client'

import { useState, useTransition } from 'react'
import { StoreLocation } from '@/types/database'
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Loader2 } from 'lucide-react'
import { createStoreAction, updateStoreAction, deleteStoreAction } from '@/app/actions/adminActions'

export default function StoresClient({ initialStores }: { initialStores: StoreLocation[] }) {
  const [stores, setStores] = useState<StoreLocation[]>(initialStores)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [googleMapUrl, setGoogleMapUrl] = useState('')

  const resetForm = () => {
    setName('')
    setAddress('')
    setPhone('')
    setWhatsapp('')
    setEmail('')
    setGoogleMapUrl('')
    setEditingStore(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (store: StoreLocation) => {
    setEditingStore(store)
    setName(store.name)
    setAddress(store.address)
    setPhone(store.phone)
    setWhatsapp(store.whatsapp)
    setEmail(store.email || '')
    setGoogleMapUrl(store.google_map_url)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name,
      address,
      phone,
      whatsapp,
      email,
      google_map_url: googleMapUrl,
    }

    startTransition(async () => {
      if (editingStore) {
        const res = await updateStoreAction(editingStore.id, payload)
        if (res.success) {
          setStores(stores.map(s => s.id === editingStore.id ? { ...s, ...payload } as StoreLocation : s))
          setIsModalOpen(false)
        } else {
          alert('Failed to update store: ' + res.error)
        }
      } else {
        const res = await createStoreAction(payload)
        if (res.success) {
          window.location.reload()
        } else {
          alert('Failed to create store: ' + res.error)
        }
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return
    
    startTransition(async () => {
      const res = await deleteStoreAction(id)
      if (res.success) {
        setStores(stores.filter(s => s.id !== id))
      } else {
        alert('Failed to delete store: ' + res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="bg-accent hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
        >
          <Plus className="h-4 w-4" /> Add New Store
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stores.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
            No stores added yet. Click 'Add New Store' to create your first location.
          </div>
        ) : (
          stores.map(store => (
            <div key={store.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group hover:border-zinc-700 transition-colors">
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(store)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  disabled={isPending}
                  className="p-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-4 pr-20">{store.name}</h3>
              
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent shrink-0" />
                  <span>{store.phone} (WA: {store.whatsapp})</span>
                </div>
                {store.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent shrink-0" />
                    <span>{store.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingStore ? 'Edit Store Location' : 'Add New Store Location'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Store Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                  placeholder="e.g. Kolhapur Branch"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                  placeholder="Full street address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                    placeholder="919876543210"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Google Maps URL *</label>
                <textarea
                  required
                  rows={2}
                  value={googleMapUrl}
                  onChange={e => setGoogleMapUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-accent outline-none font-mono"
                  placeholder="Paste Google Maps embed iframe src URL here"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-zinc-400 hover:text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent hover:bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingStore ? 'Update Store' : 'Add Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
