'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ShieldCheck, Store } from 'lucide-react'

export interface StoreSummary {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  isVerified: boolean
  activeProductsCount: number
  categories: { id: string; name: string; slug: string; emoji?: string | null }[]
  location?: { city: string; region?: string | null; country: string } | null
}

export function StoreCard({ store }: { store: StoreSummary }) {
  return (
    <article className="group flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Link href={`/stores/${store.slug}`} className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-emerald-50">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={`${store.name} logo`} fill sizes="56px" className="object-cover" />
          ) : (
            <Store className="h-6 w-6 text-emerald-800" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/stores/${store.slug}`} className="truncate text-sm font-bold text-gray-900 group-hover:text-emerald-800">
              {store.name}
            </Link>
            {store.isVerified && <ShieldCheck aria-label="Verified business" className="h-4 w-4 shrink-0 text-blue-600" />}
          </div>
          <p className="mt-1 text-xs text-gray-500">{store.activeProductsCount} active {store.activeProductsCount === 1 ? 'item' : 'items'}</p>
          {store.location && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {[store.location.city, store.location.region, store.location.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>
      {store.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-600">{store.description}</p>}
      <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
        {store.categories.slice(0, 3).map((category) => (
          <span key={category.id} className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
            {category.emoji ? `${category.emoji} ` : ''}{category.name}
          </span>
        ))}
        {store.categories.length > 3 && <span className="text-[10px] text-gray-400">+ {store.categories.length - 3} more</span>}
        {store.categories.length === 0 && <span className="text-[10px] text-gray-400">New catalogue</span>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-[11px] text-gray-400">Ratings coming soon</span>
        <Link href={`/stores/${store.slug}`} className="text-xs font-bold text-emerald-800 hover:text-emerald-950">Visit store →</Link>
      </div>
    </article>
  )
}
