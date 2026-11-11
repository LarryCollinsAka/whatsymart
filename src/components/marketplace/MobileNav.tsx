'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, ShoppingBag, User } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const navItems = [
    { label: t.nav.home, href: '/', icon: Home },
    { label: t.nav.explore, href: '/products', icon: Compass },
    { label: t.nav.orders, href: '/account/orders', icon: ShoppingBag },
    { label: t.nav.profile, href: '/account', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </div>
              <span className="text-[11px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
