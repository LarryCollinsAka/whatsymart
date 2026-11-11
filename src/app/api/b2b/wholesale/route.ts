import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  const quantity = Math.max(1, Number(request.nextUrl.searchParams.get('quantity')) || 1)
  try {
    const prices = await prisma.wholesalePrice.findMany({
      where: {
        ...(productId ? { productId } : {}),
        minQuantity: { lte: quantity },
        OR: [{ maxQuantity: null }, { maxQuantity: { gte: quantity } }],
      },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, currency: true, stock: true, isPublished: true, isApproved: true } },
        business: { select: { id: true, businessName: true, city: true, country: true } },
      },
      orderBy: [{ productId: 'asc' }, { minQuantity: 'desc' }],
    })
    const eligible = prices.filter((price) => price.product.isPublished && price.product.isApproved && price.product.stock >= quantity)
    return NextResponse.json({ prices: eligible })
  } catch (error) {
    console.error('Wholesale price lookup failed:', error)
    return NextResponse.json({ error: 'Unable to load wholesale prices.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const productId = typeof body.productId === 'string' ? body.productId : ''
    const minQuantity = Number(body.minQuantity ?? body.minimumQuantity)
    const maxQuantity = body.maxQuantity == null ? null : Number(body.maxQuantity)
    const unitPrice = Number(body.unitPrice)
    const businessId = typeof body.businessId === 'string' ? body.businessId : ''
    if (!productId || !Number.isInteger(minQuantity) || minQuantity < 2 ||
        (maxQuantity !== null && (!Number.isInteger(maxQuantity) || maxQuantity < minQuantity)) ||
        !Number.isFinite(unitPrice) || unitPrice < 0) {
      return NextResponse.json({ error: 'Product, valid quantity range and non-negative unit price are required.' }, { status: 400 })
    }
    const product = await prisma.product.findFirst({
      where: { id: productId, business: { seller: { userId: user.id }, ...(businessId ? { id: businessId } : {}) } },
      select: { id: true, businessId: true, currency: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found in your business.' }, { status: 404 })
    const price = await prisma.wholesalePrice.create({
      data: { productId, businessId: product.businessId, minQuantity, maxQuantity, unitPrice, currency: product.currency },
    })
    return NextResponse.json({ price }, { status: 201 })
  } catch (error) {
    console.error('Wholesale price creation failed:', error)
    return NextResponse.json({ error: 'Unable to create wholesale price.' }, { status: 500 })
  }
}
