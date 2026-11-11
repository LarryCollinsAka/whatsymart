'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="hidden sm:block bg-[#0f4c35] text-emerald-100 border-t border-emerald-900 mt-16 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-emerald-800/80">
          <div>
            <span className="text-xl font-black text-white">
              Whatsy<span className="text-amber-400">Mart</span>
            </span>
            <p className="mt-2 text-xs text-emerald-200/80 leading-relaxed">
              {t.footer.about}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-1 bg-emerald-900/80 rounded border border-emerald-700/50 text-amber-300">
                💳 Apple Pay & GPay
              </span>
              <span className="px-2 py-1 bg-emerald-900/80 rounded border border-emerald-700/50 text-emerald-200">
                🏦 Wire & Transfer
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">{t.footer.marketplace}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-amber-300 transition-colors">
                  {t.footer.exploreCatalog}
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-amber-300 transition-colors">
                  {t.footer.partnerStores}
                </Link>
              </li>
              <li>
                <Link href="/become-a-seller" className="hover:text-amber-300 transition-colors">
                  {t.footer.becomeCertified}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-amber-300 transition-colors">
                  {t.footer.trackOrder}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">{t.footer.popularAisles}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=grains" className="hover:text-amber-300 transition-colors">
                  Grains & Rice
                </Link>
              </li>
              <li>
                <Link href="/products?category=meat" className="hover:text-amber-300 transition-colors">
                  Meat & Fish
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics" className="hover:text-amber-300 transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty" className="hover:text-amber-300 transition-colors">
                  Cosmetics & Beauty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">{t.footer.communitySupport}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/suggestions" className="hover:text-amber-300 transition-colors">
                  💡 {t.footer.publicSuggestions}
                </Link>
              </li>
              <li>
                <Link href="/reports/new" className="hover:text-amber-300 transition-colors">
                  🛡️ {t.footer.reportProblem}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-amber-300 transition-colors">
                  {t.footer.support24}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/80 gap-3">
          <p>© 2026 WhatsyMart. {t.footer.rights}</p>
          <p className="flex items-center gap-1">
            {t.footer.madeWithLove}
          </p>
        </div>
      </div>
    </footer>
  )
}
