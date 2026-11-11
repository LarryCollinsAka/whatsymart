import { CurrencyCode, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from './types'

// Baseline fallback rates relative to 1 USD
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  XAF: 605.0, // 1 USD ≈ 605 FCFA
  NGN: 1550.0, // 1 USD ≈ 1,550 NGN
  CAD: 1.36,
  KES: 130.0,
  ZAR: 18.2,
}

interface CachedRates {
  rates: Record<CurrencyCode, number>
  lastUpdated: number
}

let ratesCache: CachedRates | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour cache

/**
 * Fetch live exchange rates from open exchange rate API
 * Fallback to cached rates or hardcoded baselines if offline
 */
export async function getLiveRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now()
  if (ratesCache && now - ratesCache.lastUpdated < CACHE_TTL_MS) {
    return ratesCache.rates
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)

    if (response.ok) {
      const data = await response.json()
      if (data && data.rates) {
        const live: Record<CurrencyCode, number> = {
          USD: 1.0,
          EUR: Number(data.rates.EUR) || FALLBACK_RATES.EUR,
          GBP: Number(data.rates.GBP) || FALLBACK_RATES.GBP,
          XAF: Number(data.rates.XAF) || Number(data.rates.XOF) || FALLBACK_RATES.XAF,
          NGN: Number(data.rates.NGN) || FALLBACK_RATES.NGN,
          CAD: Number(data.rates.CAD) || FALLBACK_RATES.CAD,
          KES: Number(data.rates.KES) || FALLBACK_RATES.KES,
          ZAR: Number(data.rates.ZAR) || FALLBACK_RATES.ZAR,
        }

        ratesCache = {
          rates: live,
          lastUpdated: now,
        }
        return live
      }
    }
  } catch (error) {
    console.warn('[Currency] Live rates fetch failed, using fallback baselines:', error)
  }

  return ratesCache?.rates || FALLBACK_RATES
}

/**
 * Convert USD base price to target currency
 */
export function convertUsdPrice(
  usdAmount: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES
): number {
  const rate = rates[targetCurrency] || 1.0
  const converted = usdAmount * rate
  return converted
}

/**
 * Format currency amount with symbol, locale grouping, and decimals
 */
export function formatCurrency(
  usdAmount: number,
  targetCurrency: CurrencyCode = DEFAULT_CURRENCY,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES
): string {
  const config =
    SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency) ||
    SUPPORTED_CURRENCIES[0]

  const converted = convertUsdPrice(usdAmount, targetCurrency, rates)

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(converted)

  if (config.symbolPosition === 'before') {
    return `${config.symbol}${formattedNum}`
  } else {
    const space = config.spaceBeforeSymbol ? ' ' : ''
    return `${formattedNum}${space}${config.symbol}`
  }
}
