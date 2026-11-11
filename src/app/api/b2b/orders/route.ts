import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const buyerBusinessId = typeof body.buyerBusinessId === 'string' ? body.buyerBusinessId : ''
    const buyerBusiness = await prisma.businessProfile.findFirst({
      where: { id: buyerBusinessId || undefined, seller: { userId: user.id }, isVerified: true, isActive: true },
      select: { id: true },
    })
    if (!buyerBusiness) return NextResponse.json({ error: 'Choose a verified buyer business profile.' }, { status: 403 })

    const rawItems = Array.isArray(body.items) ? body.items : []
    if (!rawItems.length || rawItems.length > 50) return NextResponse.json({ error: 'Add between 1 and 50 products.' }, { status: 400 })
    const quantities = new Map<string, number>()
    for (const item of rawItems) {
      const productId = typeof item.productId === 'string' ? item.productId : ''
      const quantity = Number(item.quantity)
      if (!productId || !Number.isInteger(quantity) || quantity < 2 || quantity > 100000) {
        return NextResponse.json({ error: 'Each wholesale line needs a product and quantity of at least two.' }, { status: 400 })
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity)
    }

    const productIds = [...quantities.keys()]
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true, isApproved: true, business: { is: { isActive: true, isVerified: true } } },
      select: { id: true, businessId: true, name: true, price: true, currency: true, stock: true },
    })
    if (products.length !== productIds.length) return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 400 })
    const supplierBusinessIds = [...new Set(products.map((product) => product.businessId))]
    if (supplierBusinessIds.length !== 1) {
      return NextResponse.json({ error: 'A wholesale order must contain products from one supplier business.' }, { status: 400 })
    }
    const supplierBusinessId = supplierBusinessIds[0]
    if (supplierBusinessId === buyerBusiness.id) return NextResponse.json({ error: 'A business cannot order wholesale from itself.' }, { status: 400 })
    const currencies = new Set(products.map((product) => product.currency))
    if (currencies.size !== 1) return NextResponse.json({ error: 'Products in one wholesale order must use the same currency.' }, { status: 400 })

    const lines: { productId: string; quantity: number; unitPrice: Prisma.Decimal; total: Prisma.Decimal }[] = []
    for (const product of products) {
      const quantity = quantities.get(product.id)!
      if (product.stock < quantity) return NextResponse.json({ error: `Insufficient stock for ${product.name}.` }, { status: 409 })
      const tier = await prisma.wholesalePrice.findFirst({
        where: {
          productId: product.id,
          businessId: supplierBusinessId,
          minQuantity: { lte: quantity },
          OR: [{ maxQuantity: null }, { maxQuantity: { gte: quantity } }],
        },
        orderBy: { minQuantity: 'desc' },
      })
      if (!tier) return NextResponse.json({ error: `No wholesale tier is configured for ${product.name} at quantity ${quantity}.` }, { status: 400 })
      const unitPrice = new Prisma.Decimal(tier.unitPrice)
      lines.push({ productId: product.id, quantity, unitPrice, total: unitPrice.mul(quantity) })
    }

    const subtotal = lines.reduce((sum, line) => sum.add(line.total), new Prisma.Decimal(0))
    const buyerLocationId = typeof body.buyerLocationId === 'string' ? body.buyerLocationId : null
    if (buyerLocationId) {
      const location = await prisma.businessLocation.findFirst({ where: { id: buyerLocationId, businessId: buyerBusiness.id } })
      if (!location) return NextResponse.json({ error: 'Buyer branch does not belong to the selected business.' }, { status: 400 })
    }
    const order = await prisma.businessOrder.create({
      data: {
        buyerUserId: user.id,
        buyerBusinessId: buyerBusiness.id,
        supplierBusinessId,
        buyerLocationId,
        subtotal,
        total: subtotal,
        currency: products[0].currency,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 2000) : null,
        items: { create: lines },
      },
      include: { items: { include: { product: { select: { name: true, slug: true } } } } },
    })
    return NextResponse.json({ order, message: 'Wholesale order request submitted. The supplier must confirm it before fulfilment.' }, { status: 201 })
  } catch (error) {
    console.error('Wholesale order request failed:', error)
    return NextResponse.json({ error: 'Unable to submit wholesale order request.' }, { status: 500 })
  }
}
