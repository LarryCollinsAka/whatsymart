export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'XAF'
  | 'NGN'
  | 'CAD'
  | 'KES'
  | 'ZAR'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  flag: string
  country: string
  decimals: number
  symbolPosition: 'before' | 'after'
  spaceBeforeSymbol?: boolean
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    country: 'United States',
    decimals: 2,
    symbolPosition: 'before',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    country: 'European Union',
    decimals: 2,
    symbolPosition: 'after',
    spaceBeforeSymbol: true,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    country: 'United Kingdom',
    decimals: 2,
    symbolPosition: 'before',
  },
  {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Franc CFA (BEAC)',
    flag: '🇨🇲',
    country: 'Cameroon / Central Africa',
    decimals: 0,
    symbolPosition: 'after',
    spaceBeforeSymbol: true,
  },
  {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    country: 'Nigeria',
    decimals: 0,
    symbolPosition: 'before',
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    country: 'Canada',
    decimals: 2,
    symbolPosition: 'before',
  },
  {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    country: 'Kenya',
    decimals: 0,
    symbolPosition: 'before',
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦',
    country: 'South Africa',
    decimals: 2,
    symbolPosition: 'before',
  },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'

// Map ISO 3166-1 alpha-2 country codes to appropriate currencies
export const COUNTRY_TO_CURRENCY_MAP: Record<string, CurrencyCode> = {
  // Central & West Africa CFA zone
  CM: 'XAF', // Cameroon
  GA: 'XAF', // Gabon
  CG: 'XAF', // Congo
  TD: 'XAF', // Chad
  CF: 'XAF', // Central African Republic
  GQ: 'XAF', // Equatorial Guinea
  SN: 'XAF', // Senegal
  CI: 'XAF', // Ivory Coast
  ML: 'XAF', // Mali
  BF: 'XAF', // Burkina Faso
  BJ: 'XAF', // Benin
  TG: 'XAF', // Togo
  NE: 'XAF', // Niger

  // Nigeria
  NG: 'NGN',

  // United Kingdom
  GB: 'GBP',
  IM: 'GBP',
  JE: 'GBP',
  GG: 'GBP',

  // United States & Territories
  US: 'USD',
  PR: 'USD',
  VI: 'USD',
  GU: 'USD',
  AS: 'USD',

  // Canada
  CA: 'CAD',

  // Kenya
  KE: 'KES',

  // South Africa
  ZA: 'ZAR',

  // Eurozone
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  CY: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  MT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
}
