'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppOrderButton } from './WhatsAppButton'
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { useCurrency } from '@/lib/currency/context'

export interface ProductCardProps {
  id: string
  name: string
  slug: string
  usdPrice: number // Product price in its stored currency
  priceCurrency?: string
  compareUsdPrice?: number | null
  deliveryTime?: string | null
  badge?: 'ELITE' | 'NEW' | 'PROMO' | 'LOW_STOCK' | 'VERIFIED' | null
  totalSales?: number
  weekSales?: number
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

export function ProductCard({
  name,
  slug,
  usdPrice,
  priceCurrency = 'USD',
  deliveryTime = '5 min',
  badge,
  weekSales,
  imageUrl,
  seller,
}: ProductCardProps) {
  const { t } = useTranslation()
  const { currency, format } = useCurrency()

  // USD prices can be converted using configured FX rates. Other stored
  // currencies remain in their native currency until FX coverage is available.
  const formattedPrice = priceCurrency === 'USD'
    ? format(usdPrice)
    : new Intl.NumberFormat(undefined, { style: 'currency', currency: priceCurrency }).format(usdPrice)
  const orderCurrency = priceCurrency === 'USD' ? currency : priceCurrency

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          {badge === 'LOW_STOCK' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {t.product.limitedStock}
            </span>
          ) : badge === 'VERIFIED' || seller.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              {t.product.verified}
            </span>
          ) : (
            <span className="inline-flex items-center rounded border border-amber-400 bg-amber-50/70 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {t.product.elite}
            </span>
          )}

          {deliveryTime && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              {deliveryTime}
            </span>
          )}
        </div>

        {/* Product Image Area */}
        <Link href={`/products/${slug}`} className="block overflow-hidden rounded-xl bg-gray-50/80 aspect-square relative mb-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl select-none mb-1">📦</span>
              <span className="text-[11px] text-gray-400">WhatsyMart Direct</span>
            </div>
          )}
        </Link>

        {/* Product Information */}
        <div className="space-y-1">
          <Link href={`/products/${slug}`} className="block">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 hover:text-emerald-700 transition-colors">
              {name}
            </h3>
          </Link>

          <Link href={`/stores/${seller.businessSlug || seller.storeSlug}`} className="block">
            <p className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 line-clamp-1">
              {seller.storeName}
            </p>
          </Link>

          {/* Verified activity signal; ratings are not displayed until reviews exist. */}
          <div className="pt-0.5 text-[11px] text-gray-500">
            {weekSales ? `${weekSales} ${t.product.soldThisWeek}` : t.product.available}
          </div>

          {/* Price with Live Exchange Rate Conversion */}
          <div className="pt-1.5 pb-2">
            <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Action Button with Converted Price & Active Currency */}
      <div className="pt-1">
        <WhatsAppOrderButton
          phone={seller.whatsappNumber || '237600000000'}
          productName={name}
          price={formattedPrice}
          currency={orderCurrency}
          sellerStoreName={seller.storeName}
          productUrl={typeof window !== 'undefined' ? `${window.location.origin}/products/${slug}` : undefined}
        />
      </div>
    </div>
  )
}
