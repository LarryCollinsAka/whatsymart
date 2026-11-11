'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, LoaderCircle, PackageSearch, Store } from 'lucide-react'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { StoreCard, StoreSummary } from '@/components/marketplace/StoreCard'
import { useTranslation } from '@/lib/i18n/context'

type Product = {
  id: string
  name: string
  slug: string
  price: string | number
  currency: string
  deliveryTime?: string | null
  badge?: 'ELITE' | 'NEW' | 'PROMO' | 'LOW_STOCK' | 'VERIFIED' | null
  weekSales: number
  imageUrl?: string | null
  seller: {
    id: string
    storeName: string
    storeSlug: string
    businessSlug?: string
    whatsappNumber?: string | null
    isElite?: boolean
    isVerified?: boolean
  }
}

export function HomeDiscovery() {
  const { locale } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [productResponse, storeResponse] = await Promise.all([
          fetch(`/api/products?page=1&pageSize=8&sort=popular&locale=${encodeURIComponent(locale)}`),
          fetch('/api/stores?page=1&pageSize=4&sort=recent'),
        ])
        if (!productResponse.ok || !storeResponse.ok) throw new Error('Catalogue unavailable')
        const [productData, storeData] = await Promise.all([productResponse.json(), storeResponse.json()])
        if (!active) return
        setProducts(productData.products || [])
        setStores(storeData.stores || [])
        setError(false)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [locale])

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-emerald-800" />
            <h2 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">Popular Products</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
            Browse products <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-12 text-sm text-gray-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading products…</div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                usdPrice={Number(product.price)}
                priceCurrency={product.currency}
                deliveryTime={product.deliveryTime}
                badge={product.badge}
                weekSales={product.weekSales}
                imageUrl={product.imageUrl}
                seller={product.seller}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
            {error ? 'Products could not be loaded. Please try again shortly.' : 'No approved products are available yet.'}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-800" />
            <h2 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">Featured Stores</h2>
          </div>
          <Link href="/stores" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
            Explore stores <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-12 text-sm text-gray-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading stores…</div>
        ) : stores.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((store) => <StoreCard key={store.id} store={store} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
            {error ? 'Stores could not be loaded. Please try again shortly.' : 'No approved stores are available yet.'}
          </div>
        )}
      </section>
    </div>
  )
}
