'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, ShieldCheck, Store, LoaderCircle } from 'lucide-react'
import { ProductCard } from '@/components/marketplace/ProductCard'

type StoreDetail = {
  id: string; name: string; slug: string; description?: string | null; logoUrl?: string | null
  isVerified: boolean; city: string; country: string
  locations: { id: string; name: string; address: string; city: string; country: string; offersDelivery: boolean; offersPickup: boolean }[]
  products: {
    id: string; name: string; slug: string; price: string | number; currency: string; stock: number
    deliveryTime?: string | null; badge?: 'ELITE' | 'NEW' | 'PROMO' | 'LOW_STOCK' | 'VERIFIED' | null
    weekSales: number; imageUrl?: string | null
    seller: { id: string; storeName: string; storeSlug: string; businessSlug: string; whatsappNumber?: string | null; isElite: boolean; isVerified: boolean }
  }[]
}

export default function StoreDetailPage() {
  const params = useParams<{ slug: string }>()
  const [store, setStore] = useState<StoreDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetch(`/api/stores/${encodeURIComponent(params.slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'This store is not available.' : 'Unable to load this store.')
        return response.json()
      })
      .then((data) => { if (active) setStore(data.store) })
      .catch((reason: Error) => { if (active) setError(reason.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [params.slug])

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center gap-2 text-sm text-gray-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading store…</div>
  if (error || !store) return <main className="mx-auto max-w-5xl px-4 py-16 text-center"><p className="text-sm text-gray-600">{error || 'Store not found.'}</p><Link href="/stores" className="mt-4 inline-block text-sm font-bold text-emerald-800">Browse stores</Link></main>

  const primaryLocation = store.locations[0]
  return (
    <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/stores" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-800"><ArrowLeft className="h-4 w-4" /> All stores</Link>
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-emerald-800">
            {store.logoUrl ? <img src={store.logoUrl} alt={`${store.name} logo`} className="h-full w-full object-cover" /> : <Store className="h-9 w-9" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h1 className="text-2xl font-black text-gray-950 sm:text-3xl">{store.name}</h1>{store.isVerified && <ShieldCheck className="h-5 w-5 text-blue-600" />}</div>
            {store.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{store.description}</p>}
            {primaryLocation && <p className="mt-2 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" />{[primaryLocation.address, primaryLocation.city, primaryLocation.country].filter(Boolean).join(', ')}</p>}
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center"><p className="text-xl font-black text-emerald-900">{store.products.length}</p><p className="text-[11px] text-emerald-800">Active products</p></div>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-black text-gray-900">Store catalogue</h2>
        {store.products.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{store.products.map((product) => <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug} usdPrice={Number(product.price)} priceCurrency={product.currency} deliveryTime={product.deliveryTime} badge={product.badge} weekSales={product.weekSales} imageUrl={product.imageUrl} seller={product.seller} />)}</div> : <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">This store has no approved products available yet.</div>}
      </section>
    </main>
  )
}
