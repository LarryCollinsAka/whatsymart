import { lemonSqueezySetup, createCheckout, getOrder } from '@lemonsqueezy/lemonsqueezy.js'
import crypto from 'crypto'

if (process.env.LEMON_SQUEEZY_API_KEY) {
  lemonSqueezySetup({ apiKey: process.env.LEMON_SQUEEZY_API_KEY })
}

const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || ''

export type CreateCheckoutParams = {
  variantId: string
  orderId: string
  customerEmail: string
  customerName: string
  amount?: number
}

/**
 * Create a Lemon Squeezy hosted checkout session
 */
export async function createLSCheckout(params: CreateCheckoutParams) {
  if (!process.env.LEMON_SQUEEZY_API_KEY || !STORE_ID) {
    throw new Error('Lemon Squeezy API credentials are not configured.')
  }

  const { data, error } = await createCheckout(STORE_ID, params.variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    checkoutData: {
      email: params.customerEmail,
      name: params.customerName,
      custom: {
        order_id: params.orderId,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout/success?order=${params.orderId}`,
      receiptButtonText: 'Voir la commande',
      receiptLinkUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/account/orders`,
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  })

  if (error) throw new Error(`Lemon Squeezy checkout error: ${error.message}`)
  return data
}

/**
 * Verify webhook signature with timingSafeEqual
 */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac('sha256', secret)
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
  const sig = Buffer.from(signature, 'utf8')

  if (digest.length !== sig.length) return false
  return crypto.timingSafeEqual(digest, sig)
}

export { getOrder }
