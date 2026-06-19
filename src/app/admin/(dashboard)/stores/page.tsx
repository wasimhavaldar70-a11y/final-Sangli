import { Metadata } from 'next'
import { getStores } from '@/services/api'
import { StoreLocation } from '@/types/database'
import StoresClient from './StoresClient'
import { Store } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage Stores | Sangli Ceramica Admin',
  description: 'Manage store locations and branches',
}

export default async function AdminStoresPage() {
  const stores = await getStores()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Store className="h-8 w-8 text-accent" />
          Store Locations
        </h1>
        <p className="text-zinc-400 mt-2 max-w-2xl text-sm">
          Add and manage multiple physical showroom locations or warehouses. These will be displayed on the public Contact page.
        </p>
      </div>

      <StoresClient initialStores={stores} />
    </div>
  )
}
