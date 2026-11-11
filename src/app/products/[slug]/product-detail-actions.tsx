'use client'

import { useMemo, useState } from 'react'
import { ShoppingCart, MessageCircle } from 'lucide-react'

type Product = { id: string; name: string; price: number; currency: string; stock: number; sellerName: string; whatsappNumber: string; slug: string }
type Variant = { id: string; name: string; value: string; priceAdjustment: number; stock: number }

export function ProductDetailActions({ product, variants }: { product: Product; variants: Variant[] }) {
  const groups = useMemo(() => [...new Set(variants.map((variant) => variant.name))], [variants])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const selectedVariants = variants.filter((variant) => selected[variant.name] === variant.id)
  const availableStock = selectedVariants.length ? Math.min(...selectedVariants.map((variant) => variant.stock)) : product.stock
  const unitPrice = product.price + selectedVariants.reduce((sum, variant) => sum + variant.priceAdjustment, 0)
  const needsChoice = groups.some((group) => !selected[group])
  const unavailable = availableStock < 1 || needsChoice
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency }).format(unitPrice)

  const addToCart = () => {
    const key = 'whatsym_cart'
    let cart: Array<{ productId: string; quantity: number; variantIds?: string[]; unitPrice?: number }>
    try { cart = JSON.parse(localStorage.getItem(key) || '[]') } catch { cart = [] }
    const variantIds = selectedVariants.map((variant) => variant.id).sort()
    const existing = cart.find((item) => item.productId === product.id && JSON.stringify([...(item.variantIds || [])].sort()) === JSON.stringify(variantIds))
    if (existing) existing.quantity = Math.min(availableStock, existing.quantity + quantity)
    else cart.push({ productId: product.id, quantity, variantIds, unitPrice })
    localStorage.setItem(key, JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('whatsym:cart-updated', { detail: cart }))
    window.alert('Added to your cart.')
  }
  const orderWhatsApp = () => {
    const choice = selectedVariants.map((variant) => `${variant.name}: ${variant.value}`).join(', ')
    const message = `Hello ${product.sellerName}, I would like to order ${quantity} x ${product.name}${choice ? ` (${choice})` : ''} at ${money} each. Product: ${window.location.origin}/products/${product.slug}`
    window.open(`https://wa.me/${product.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }
  return <div className="space-y-4">
    {groups.length > 0 && <div className="space-y-3"><h2 className="font-bold text-gray-900">Choose variations</h2>{groups.map((group) => <div key={group}><p className="mb-2 text-sm font-semibold text-gray-700">{group}</p><div className="flex flex-wrap gap-2">{variants.filter((variant) => variant.name === group).map((variant) => <button key={variant.id} type="button" disabled={variant.stock < 1} onClick={() => { setSelected((current) => ({ ...current, [group]: variant.id })); setQuantity(1) }} className={`rounded-xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${selected[group] === variant.id ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-700' : 'border-gray-200 bg-white text-gray-700'}`}>{variant.value}{variant.priceAdjustment ? <span className="ml-1 text-xs">({variant.priceAdjustment > 0 ? '+' : ''}{variant.priceAdjustment})</span> : null}</button>)}</div></div>)}</div>}
    {needsChoice && <p className="text-xs text-amber-700">Select an option for each variation before ordering.</p>}
    <div className="flex flex-wrap items-center gap-3"><span className="text-sm font-semibold">Quantity</span><div className="flex items-center rounded-xl border bg-white"><button disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 disabled:opacity-30" aria-label="Decrease quantity">−</button><span className="min-w-10 text-center font-bold">{quantity}</span><button disabled={quantity >= availableStock} onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))} className="px-4 py-2 disabled:opacity-30" aria-label="Increase quantity">+</button></div><span className="text-xs text-gray-500">{availableStock > 0 ? `${availableStock} available` : 'Out of stock'}</span><span className="ml-auto font-bold text-emerald-800">{money}</span></div>
    <button disabled={unavailable} onClick={addToCart} className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900 disabled:opacity-40 flex items-center justify-center gap-2"><ShoppingCart size={18}/> Add to cart</button>
    <button disabled={unavailable || !product.whatsappNumber} onClick={orderWhatsApp} className="w-full rounded-xl border border-emerald-800 px-5 py-3 font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-40 flex items-center justify-center gap-2"><MessageCircle size={18}/> Order via WhatsApp</button>
  </div>
}
