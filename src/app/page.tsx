'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { CategoryChips } from '@/components/marketplace/CategoryChips'
import { Zap, ShieldCheck, MessageCircle, Gift, Share2, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { useCurrency } from '@/lib/currency/context'
import { HomeDiscovery } from '@/components/marketplace/HomeDiscovery'

export default function HomePage() {
  const { t } = useTranslation()
  const { currency, activeConfig, rates } = useCurrency()
  const [copied, setCopied] = useState(false)

  const copyReferralLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/register?ref=whatsy2026`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const currentRate = rates[currency] || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      {/* Hero Banner with Forest Green Gradient */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f4c35] via-[#166534] to-[#15803d] text-white p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-600/40 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Live Exchange Rate Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                1 USD = {currentRate >= 10 ? Math.round(currentRate) : currentRate.toFixed(2)} {activeConfig.code}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t.hero.titlePart1}
            <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-4">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titlePart2}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
            {t.hero.subtitle}
          </p>

          {/* Quick Value Props */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-emerald-200">
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">✓</span> {t.hero.verifiedSellers}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">✓</span> {t.hero.payments}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">✓</span> {t.hero.expressDelivery}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">✓</span> {t.hero.whatsappSupport}
            </span>
          </div>
        </div>

        {/* Ambient Decorative Shapes */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-10 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </section>

      {/* Categories Horizontal Pills */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {t.common.allDepartments}
          </h2>
          <Link href="/products" className="text-xs font-semibold text-emerald-800 hover:underline">
            {t.common.seeAll}
          </Link>
        </div>
        <Suspense fallback={<div className="h-10 w-full bg-gray-100 rounded-full animate-pulse" />}>
          <CategoryChips />
        </Suspense>
      </section>

      {/* Live database-backed product and store discovery */}
      <HomeDiscovery />

      {/* Why Choose WhatsyMart Value Pillars */}
      <section className="rounded-3xl bg-emerald-50/70 border border-emerald-100 p-6 sm:p-8">
        <h3 className="text-center text-lg sm:text-xl font-black text-emerald-950 mb-6">
          {t.features.whyChoose}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{t.features.fasterTitle}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t.features.fasterDesc}</p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{t.features.verifiedTitle}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t.features.verifiedDesc}</p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-white/80 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">{t.features.instantTitle}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{t.features.instantDesc}</p>
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-[#0f4c35] to-[#166534] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 font-bold text-amber-300 text-sm">
            <Gift className="w-4 h-4" />
            <span>{t.referral.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            {t.referral.desc}
          </p>
        </div>

        <button
          onClick={copyReferralLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? t.referral.copied : t.referral.shareBtn}</span>
        </button>
      </section>
    </div>
  )
}
