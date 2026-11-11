'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  CurrencyCode,
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  COUNTRY_TO_CURRENCY_MAP,
} from './types'
import { FALLBACK_RATES, convertUsdPrice, formatCurrency } from './rates'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  rates: Record<CurrencyCode, number>
  ratesLoading: boolean
  convert: (usdAmount: number, target?: CurrencyCode) => number
  format: (usdAmount: number, target?: CurrencyCode) => string
  supportedCurrencies: CurrencyConfig[]
  activeConfig: CurrencyConfig
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rates: FALLBACK_RATES,
  ratesLoading: false,
  convert: (amt) => amt,
  format: (amt) => `$${amt.toFixed(2)}`,
  supportedCurrencies: SUPPORTED_CURRENCIES,
  activeConfig: SUPPORTED_CURRENCIES[0],
})

function inferCurrencyFromTimezone(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz.includes('Douala') || tz.includes('Lagos') === false && tz.includes('Africa/')) {
      if (tz.includes('Douala') || tz.includes('Brazzaville') || tz.includes('Libreville')) {
        return 'XAF'
      }
    }
    if (tz.includes('Lagos')) return 'NGN'
    if (tz.includes('London')) return 'GBP'
    if (tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Madrid') || tz.includes('Amsterdam') || tz.includes('Rome')) {
      return 'EUR'
    }
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) return 'CAD'
    if (tz.includes('Nairobi')) return 'KES'
    if (tz.includes('Johannesburg')) return 'ZAR'
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles')) return 'USD'
  } catch {
    // fallback
  }
  return DEFAULT_CURRENCY
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES)
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    // 1. Check if user already manually selected a currency
    const stored = typeof window !== 'undefined' ? localStorage.getItem('wm_currency') : null
    const validStored = SUPPORTED_CURRENCIES.find((c) => c.code === stored)

    if (validStored) {
      setCurrencyState(validStored.code)
    }

    // 2. Fetch detected IP currency and live exchange rates from our server endpoint
    setRatesLoading(true)
    fetch('/api/currency')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates)
        }
        // If user hasn't explicitly chosen a currency before, apply IP-detected currency
        if (!validStored && data && data.detectedCurrency) {
          setCurrencyState(data.detectedCurrency)
        }
      })
      .catch(() => {
        // Fallback to timezone inference if offline/error
        if (!validStored) {
          setCurrencyState(inferCurrencyFromTimezone())
        }
      })
      .finally(() => {
        setRatesLoading(false)
      })
  }, [])

  const setCurrency = (newCode: CurrencyCode) => {
    const valid = SUPPORTED_CURRENCIES.find((c) => c.code === newCode)
    if (valid) {
      setCurrencyState(valid.code)
      if (typeof window !== 'undefined') {
        localStorage.setItem('wm_currency', valid.code)
        document.cookie = `wm_currency=${valid.code}; path=/; max-age=31536000; SameSite=Lax`
      }
    }
  }

  const convert = (usdAmount: number, target?: CurrencyCode) => {
    return convertUsdPrice(usdAmount, target || currency, rates)
  }

  const format = (usdAmount: number, target?: CurrencyCode) => {
    return formatCurrency(usdAmount, target || currency, rates)
  }

  const activeConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0]

  const value = {
    currency,
    setCurrency,
    rates,
    ratesLoading,
    convert,
    format,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    activeConfig,
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
