/**
 * Multilingual WhatsApp utility — Phase 1: wa.me deep-link generator
 * Supports English (primary), French, Spanish, Portuguese, Dutch.
 * Easily extensible to any new locale.
 */

import { Locale } from './i18n/types'

export type OrderLinkData = {
  phone: string
  productName: string
  productUrl?: string
  price: number | string
  currency: string
  sellerStoreName: string
  locale?: Locale
}

export type InquiryLinkData = {
  phone: string
  productName: string
  productUrl?: string
  locale?: Locale
}

const ORDER_MESSAGES: Record<Locale, (data: OrderLinkData) => string> = {
  en: (d) =>
    [
      `Hello! I'd like to order from *${d.sellerStoreName}* on WhatsyMart 🛒`,
      ``,
      `*Product:* ${d.productName}`,
      `*Price:* ${d.currency} ${d.price}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Please confirm availability and delivery timeframe. Thank you!`,
    ]
      .filter(Boolean)
      .join('\n'),

  fr: (d) =>
    [
      `Bonjour! Je souhaite commander chez *${d.sellerStoreName}* sur WhatsyMart 🛒`,
      ``,
      `*Produit:* ${d.productName}`,
      `*Prix:* ${d.currency} ${d.price}`,
      d.productUrl ? `*Lien:* ${d.productUrl}` : '',
      ``,
      `Veuillez confirmer la disponibilité et le délai de livraison. Merci!`,
    ]
      .filter(Boolean)
      .join('\n'),

  es: (d) =>
    [
      `¡Hola! Me gustaría hacer un pedido a *${d.sellerStoreName}* en WhatsyMart 🛒`,
      ``,
      `*Producto:* ${d.productName}`,
      `*Precio:* ${d.currency} ${d.price}`,
      d.productUrl ? `*Enlace:* ${d.productUrl}` : '',
      ``,
      `Por favor confirme disponibilidad y tiempo estimado de entrega. ¡Gracias!`,
    ]
      .filter(Boolean)
      .join('\n'),

  pt: (d) =>
    [
      `Olá! Gostaria de fazer um pedido de *${d.sellerStoreName}* no WhatsyMart 🛒`,
      ``,
      `*Produto:* ${d.productName}`,
      `*Preço:* ${d.currency} ${d.price}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Por favor, confirme a disponibilidade e o prazo de entrega. Obrigado!`,
    ]
      .filter(Boolean)
      .join('\n'),

  nl: (d) =>
    [
      `Hallo! Ik wil graag bestellen bij *${d.sellerStoreName}* op WhatsyMart 🛒`,
      ``,
      `*Product:* ${d.productName}`,
      `*Prijs:* ${d.currency} ${d.price}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Kunt u de beschikbaarheid en levertijd bevestigen? Hartelijk dank!`,
    ]
      .filter(Boolean)
      .join('\n'),
}

const INQUIRY_MESSAGES: Record<Locale, (d: InquiryLinkData) => string> = {
  en: (d) =>
    [
      `Hello! I found your listing on WhatsyMart and have a question regarding:`,
      ``,
      `*Product:* ${d.productName}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Could you please assist me?`,
    ]
      .filter(Boolean)
      .join('\n'),

  fr: (d) =>
    [
      `Bonjour! J'ai une question concernant votre article sur WhatsyMart:`,
      ``,
      `*Produit:* ${d.productName}`,
      d.productUrl ? `*Lien:* ${d.productUrl}` : '',
      ``,
      `Pouvez-vous m'aider s'il vous plaît?`,
    ]
      .filter(Boolean)
      .join('\n'),

  es: (d) =>
    [
      `¡Hola! Tengo una consulta sobre su artículo en WhatsyMart:`,
      ``,
      `*Producto:* ${d.productName}`,
      d.productUrl ? `*Enlace:* ${d.productUrl}` : '',
      ``,
      `¿Podría ayudarme por favor?`,
    ]
      .filter(Boolean)
      .join('\n'),

  pt: (d) =>
    [
      `Olá! Tenho uma dúvida sobre seu anúncio no WhatsyMart:`,
      ``,
      `*Produto:* ${d.productName}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Poderia me ajudar, por favor?`,
    ]
      .filter(Boolean)
      .join('\n'),

  nl: (d) =>
    [
      `Hallo! Ik heb een vraag over uw artikel op WhatsyMart:`,
      ``,
      `*Product:* ${d.productName}`,
      d.productUrl ? `*Link:* ${d.productUrl}` : '',
      ``,
      `Kunt u mij hiermee helpen?`,
    ]
      .filter(Boolean)
      .join('\n'),
}

export function generateOrderLink(data: OrderLinkData): string {
  const loc = data.locale || 'en'
  const template = ORDER_MESSAGES[loc] || ORDER_MESSAGES.en
  const message = template(data)
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function generateInquiryLink(data: InquiryLinkData): string {
  const loc = data.locale || 'en'
  const template = INQUIRY_MESSAGES[loc] || INQUIRY_MESSAGES.en
  const message = template(data)
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
