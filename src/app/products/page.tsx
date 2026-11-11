'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, ArrowUpDown, Package, LoaderCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { ProductCard } from '@/components/marketplace/ProductCard'

type CatalogueProduct = {
  id: string
  name: string
  slug: string
  price: string | number
  currency: string
  weekSales: number
  deliveryTime?: string | null
  badge?: 'ELITE' | 'NEW' | 'PROMO' | 'LOW_STOCK' | 'VERIFIED' | null
  imageUrl?: string | null
  category: { name: string; slug: string; emoji?: string | null } | null
  seller: {
    id: string
    storeName: string
    storeSlug: string
    businessSlug: string
    whatsappNumber?: string | null
    isElite?: boolean
    isVerified?: boolean
  }
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc'>('popular')
  const [products, setProducts] = useState<CatalogueProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    const params = new URLSearchParams({ page: '1', pageSize: '48', q: search.trim(), sort: sortBy, locale })
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    fetch(`/api/products?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalogue unavailable')
        return response.json()
      })
      .then((data) => { if (active) setProducts(data.products || []) })
      .catch(() => { if (active) setError(true); if (active) setProducts([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, selectedCategory, sortBy, locale])

  const categories = useMemo(() => {
    const unique = new Map<string, { slug: string; name: string; emoji?: string | null }>()
    products.forEach((product) => {
      if (product.category) unique.set(product.category.slug, product.category)
    })
    return Array.from(unique.values())
  }, [products])

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-r from-[#0f4c35] via-[#166534] to-[#15803d] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="mb-1 flex items-center gap-2"><span className="text-xl">🛒</span><h1 className="text-2xl font-black sm:text-3xl">{t.catalog.title}</h1></div>
          <p className="max-w-xl text-xs text-emerald-100 sm:text-sm">{t.catalog.subtitle}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.catalog.searchPlaceholder} className="w-full rounded-xl bg-white/95 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-400" />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </section>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button onClick={() => setSelectedCategory('all')} className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-bold ${selectedCategory === 'all' ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-gray-200 bg-white text-gray-700'}`}>All categories</button>
          {categories.map((category) => (
            <button key={category.slug} onClick={() => setSelectedCategory(category.slug)} className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-bold ${selectedCategory === category.slug ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-gray-200 bg-white text-gray-700'}`}>
              {category.emoji ? `${category.emoji} ` : ''}{category.name}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">{t.catalog.sortBy}:</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-600">
            <option value="popular">{t.catalog.popular}</option>
            <option value="priceAsc">{t.catalog.priceAsc}</option>
            <option value="priceDesc">{t.catalog.priceDesc}</option>
          </select>
        </div>
      </div>

      {search && <p className="text-xs text-gray-500">Search results for <strong>{search}</strong> · {products.length} products</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading catalogue…</div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">The catalogue could not be loaded. Please try again.</div>
      ) : products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug} usdPrice={Number(product.price)} priceCurrency={product.currency} badge={product.badge} weekSales={product.weekSales} deliveryTime={product.deliveryTime} imageUrl={product.imageUrl} seller={product.seller} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-8 py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">{t.catalog.noProductsFound}</h3>
          <p className="mx-auto max-w-sm text-xs text-gray-400">No approved products match these filters yet.</p>
          <button onClick={() => { setSearch(''); setSelectedCategory('all') }} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900">Reset filters</button>
        </div>
      )}
    </main>
  )
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-gray-400">Loading catalogue…</div>}><ProductsContent /></Suspense>
}
