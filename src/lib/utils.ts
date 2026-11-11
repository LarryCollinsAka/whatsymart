import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  if (currency === 'FCFA' || currency === 'XAF') {
    return `${Math.round(price).toLocaleString('fr-FR')} FCFA`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}
