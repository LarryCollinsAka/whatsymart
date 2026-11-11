'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { Search, Store, LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { StoreCard, StoreSummary } from '@/components/marketplace/StoreCard'

type StoreResponse = { stores: StoreSummary[]; pagination: { page: number; totalPages: number; total: number } }

export default function StoresPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<StoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetch(`/api/stores?page=${page}&pageSize=12&q=${encodeURIComponent(search)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Stores are temporarily unavailable.')
        return response.json()
      })
      .then((result) => { if (active) setData(result) })
      .catch((reason: Error) => { if (active) setError(reason.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, search])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSearch(query.trim())
  }

  return (
    <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-r from-[#0f4c35] via-[#166534] to-[#15803d] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-300"><Store className="h-6 w-6" /><span className="text-xs font-bold uppercase tracking-wider">WhatsyMart directory</span></div>
          <h1 className="text-2xl font-black sm:text-3xl">Discover stores</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">Explore independent businesses, browse their catalogues and find stores serving your area.</p>
        </div>
        <Link href="/become-a-seller" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-amber-300">Open a store</Link>
      </section>

      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores, products or locations…" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
        </div>
        <button type="submit" className="rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white hover:bg-emerald-900">Search</button>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">Stores on WhatsyMart</h2>
        {data && <span className="text-xs text-gray-500">{data.pagination.total} {data.pagination.total === 1 ? 'store' : 'stores'}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading stores…</div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : data?.stores.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.stores.map((store) => <StoreCard key={store.id} store={store} />)}
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-5">
            <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <span className="text-xs text-gray-500">Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}</span>
            <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-14 text-center">
          <Store className="mx-auto h-8 w-8 text-gray-300" />
          <h3 className="mt-3 font-bold text-gray-800">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">Try a different search, or check back as businesses join WhatsyMart.</p>
        </div>
      )}
    </main>
  )
}
