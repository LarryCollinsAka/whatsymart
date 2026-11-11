'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Lightbulb,
  ShieldAlert,
  User,
  MapPin,
  Check,
  Coins
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { Locale } from '@/lib/i18n/types'
import { useCurrency } from '@/lib/currency/context'
import { CurrencyCode } from '@/lib/currency/types'

export function Header() {
  const { locale, setLocale, t, supportedLocales } = useTranslation()
  const { currency, setCurrency, supportedCurrencies, activeConfig, rates } = useCurrency()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const langRef = useRef<HTMLDivElement | null>(null)
  const currRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false)
      }
      if (currRef.current && !currRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const currentLang = supportedLocales.find((l) => l.code === locale) || supportedLocales[0]

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f4c35] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Hub */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Whatsy<span className="text-amber-400">Mart</span>
              </span>
            </Link>

            <div className="hidden xl:flex items-center gap-1 text-xs bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{t.common.cities}</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="w-full pl-9 pr-20 py-2 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border-0"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {t.common.searchBtn}
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <Link href="/products" className="text-emerald-100 hover:text-white transition-colors">
              {t.nav.explore}
            </Link>
            <Link href="/stores" className="text-emerald-100 hover:text-white transition-colors">
              Stores
            </Link>
            <Link
              href="/suggestions"
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {t.nav.suggestions}
            </Link>
            <Link
              href="/become-a-seller"
              className="text-emerald-100 hover:text-white transition-colors"
            >
              {t.nav.becomeSeller}
            </Link>
          </nav>

          {/* Controls: Language Switcher, Currency Switcher, Orders, User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* 1. Currency Switcher Dropdown */}
            <div className="relative" ref={currRef}>
              <button
                type="button"
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen)
                  setLangDropdownOpen(false)
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-xs font-semibold text-amber-300 transition-colors"
                title="Switch Currency / Taux de change en direct"
              >
                <span className="text-sm leading-none">{activeConfig.flag}</span>
                <span className="font-bold text-[11px]">{activeConfig.code}</span>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 flex items-center justify-between">
                    <span>Currency / Devise</span>
                    <span className="text-emerald-600 font-bold lowercase">Live Rates</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {supportedCurrencies.map((item) => {
                      const rate = rates[item.code] || 1
                      return (
                        <button
                          key={item.code}
                          onClick={() => {
                            setCurrency(item.code as CurrencyCode)
                            setCurrencyDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-emerald-50 transition-colors text-left ${
                            currency === item.code ? 'text-emerald-800 font-bold bg-emerald-50/70' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.flag}</span>
                            <div>
                              <p className="font-bold leading-none">{item.code} ({item.symbol})</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{item.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {currency === item.code && <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto" />}
                            <span className="text-[10px] text-gray-400 block font-mono">
                              1 $ = {rate >= 10 ? Math.round(rate) : rate.toFixed(2)} {item.symbol}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Language Switcher Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen)
                  setCurrencyDropdownOpen(false)
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-xs font-semibold text-white transition-colors"
                title="Switch Language / Idioma"
              >
                <span className="text-sm leading-none">{currentLang.flag}</span>
                <span className="uppercase font-bold text-[11px]">{currentLang.code}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                    Language / Idioma
                  </div>
                  {supportedLocales.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLocale(item.code as Locale)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-emerald-50 transition-colors text-left ${
                        locale === item.code ? 'text-emerald-800 font-bold bg-emerald-50/60' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {locale === item.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/account/orders"
              className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-colors relative"
              aria-label={t.nav.orders}
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs transition-colors shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.nav.login}</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-emerald-100 hover:text-white focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-9 pr-16 py-2 rounded-xl bg-white text-gray-900 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-lg"
            >
              {t.common.searchBtn}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/95 border-t border-emerald-800/80 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-100 hover:text-white font-medium text-sm"
          >
            {t.nav.explore}
          </Link>
          <Link
            href="/stores"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-100 hover:text-white font-medium text-sm"
          >
            Stores
          </Link>
          <Link
            href="/suggestions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-amber-300 font-medium text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            {t.nav.suggestions}
          </Link>
          <Link
            href="/reports/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-emerald-200 font-medium text-sm"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            {t.nav.reportIssue}
          </Link>
          <Link
            href="/become-a-seller"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-100 hover:text-white font-medium text-sm"
          >
            {t.nav.becomeSeller}
          </Link>

          {/* Currency Selector in Mobile Menu */}
          <div className="pt-2 border-t border-emerald-800/60 space-y-1">
            <p className="text-[10px] uppercase font-bold text-emerald-300/70 mb-1 flex items-center justify-between">
              <span>Currency / Devise:</span>
              <span className="text-amber-400 font-mono text-[10px]">Active: {currency}</span>
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {supportedCurrencies.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setCurrency(item.code as CurrencyCode)
                  }}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-semibold border ${
                    currency === item.code
                      ? 'bg-amber-400 text-emerald-950 border-amber-400'
                      : 'bg-emerald-900/60 text-emerald-100 border-emerald-800'
                  }`}
                >
                  <span className="text-sm">{item.flag}</span>
                  <span className="text-[10px] font-bold">{item.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector in Mobile Menu */}
          <div className="pt-2 border-t border-emerald-800/60 space-y-1">
            <p className="text-[10px] uppercase font-bold text-emerald-300/70 mb-1">
              Language / Idioma:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {supportedLocales.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLocale(item.code as Locale)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                    locale === item.code
                      ? 'bg-amber-400 text-emerald-950 border-amber-400'
                      : 'bg-emerald-900/60 text-emerald-100 border-emerald-800'
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-800/60 flex items-center gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 bg-emerald-800 text-white font-semibold rounded-xl text-xs border border-emerald-700"
            >
              {t.nav.register}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
