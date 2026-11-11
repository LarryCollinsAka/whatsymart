'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES, Dictionary } from './types'
import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'
import { es } from './dictionaries/es'
import { pt } from './dictionaries/pt'
import { nl } from './dictionaries/nl'

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  fr,
  es,
  pt,
  nl,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
  supportedLocales: typeof SUPPORTED_LOCALES
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: en,
  supportedLocales: SUPPORTED_LOCALES,
})

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined' || !navigator) return DEFAULT_LOCALE

  // 1. Check user-preferred browser languages array
  const candidates: string[] = []
  if (navigator.languages && navigator.languages.length) {
    for (const lang of navigator.languages) {
      candidates.push(lang)
    }
  }
  if (navigator.language) {
    candidates.push(navigator.language)
  }

  // 2. Match against supported locales (e.g., 'fr-FR' -> 'fr', 'pt-BR' -> 'pt')
  for (const candidate of candidates) {
    const code = candidate.split('-')[0].toLowerCase() as Locale
    if (DICTIONARIES[code]) {
      return code
    }
  }

  // 3. Fallback to English
  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wm_locale') as Locale
      if (stored && DICTIONARIES[stored]) {
        setLocaleState(stored)
      } else {
        // Auto-detect browser language; fallback to English
        const detected = detectBrowserLocale()
        setLocaleState(detected)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (DICTIONARIES[newLocale]) {
      setLocaleState(newLocale)
      if (typeof window !== 'undefined') {
        localStorage.setItem('wm_locale', newLocale)
        document.cookie = `wm_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      }
    }
  }

  const value = {
    locale,
    setLocale,
    t: DICTIONARIES[locale] || en,
    supportedLocales: SUPPORTED_LOCALES,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}

export function useI18n() {
  const context = useTranslation()
  return {
    ...context,
    dict: context.t,
  }
}
