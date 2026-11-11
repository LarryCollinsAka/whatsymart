import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const rfqs = await prisma.requestForQuotation.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        business: { select: { id: true, businessName: true, city: true, country: true, isVerified: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    })
    return NextResponse.json({ rfqs })
  } catch (error) {
    console.error('RFQ lookup failed:', error)
    return NextResponse.json({ error: 'Unable to load RFQs.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const businessId = typeof body.businessId === 'string' ? body.businessId : ''
    const business = await prisma.businessProfile.findFirst({
      where: { id: businessId || undefined, seller: { userId: user.id }, isActive: true },
      select: { id: true },
    })
    if (!business) return NextResponse.json({ error: 'Choose one of your active business profiles.' }, { status: 403 })
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title || title.length > 160) return NextResponse.json({ error: 'A title of up to 160 characters is required.' }, { status: 400 })

    const rawItems = Array.isArray(body.items) ? body.items : []
    if (!rawItems.length || rawItems.length > 50) return NextResponse.json({ error: 'Add between 1 and 50 RFQ line items.' }, { status: 400 })
    const items = rawItems.map((item: Record<string, unknown>) => ({
      productId: typeof item.productId === 'string' ? item.productId : null,
      description: typeof item.description === 'string' ? item.description.trim().slice(0, 500) : '',
      quantity: Number(item.quantity),
      unit: typeof item.unit === 'string' ? item.unit.slice(0, 30) : 'unit',
    }))
    if (items.some((item: { description: string; quantity: number }) => !item.description || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return NextResponse.json({ error: 'Every RFQ item needs a description and positive whole-number quantity.' }, { status: 400 })
    }
    const productIds = items.flatMap((item: { productId: string | null }) => item.productId ? [item.productId] : [])
    if (productIds.length) {
      const count = await prisma.product.count({ where: { id: { in: productIds } } })
      if (count !== new Set(productIds).size) return NextResponse.json({ error: 'One or more referenced products do not exist.' }, { status: 400 })
    }
    const neededBy = body.neededBy ? new Date(body.neededBy) : null
    if (neededBy && (!Number.isFinite(neededBy.getTime()) || neededBy <= new Date())) {
      return NextResponse.json({ error: 'Needed-by date must be in the future.' }, { status: 400 })
    }

    const rfq = await prisma.requestForQuotation.create({
      data: {
        businessId: business.id,
        createdById: user.id,
        title,
        description: typeof body.description === 'string' ? body.description.slice(0, 5000) : null,
        neededBy,
        items: { create: items },
      },
      include: { items: true },
    })
    return NextResponse.json({ rfq }, { status: 201 })
  } catch (error) {
    console.error('RFQ creation failed:', error)
    return NextResponse.json({ error: 'Unable to create RFQ.' }, { status: 500 })
  }
}
