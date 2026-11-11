import { NextRequest, NextResponse } from 'next/server'
import { getLiveRates } from '@/lib/currency/rates'
import { COUNTRY_TO_CURRENCY_MAP, DEFAULT_CURRENCY, CurrencyCode } from '@/lib/currency/types'

export async function GET(request: NextRequest) {
  try {
    // 1. Detect country from Vercel / Cloudflare edge headers
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country-code') ||
      'US'

    const upperCountry = country.toUpperCase()
    const detectedCurrency: CurrencyCode =
      COUNTRY_TO_CURRENCY_MAP[upperCountry] || DEFAULT_CURRENCY

    // 2. Fetch live exchange rates
    const rates = await getLiveRates()

    return NextResponse.json({
      success: true,
      country: upperCountry,
      detectedCurrency,
      rates,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        country: 'US',
        detectedCurrency: DEFAULT_CURRENCY,
        error: 'Failed to retrieve live rates',
      },
      { status: 500 }
    )
  }
}
