import { NextRequest, NextResponse } from 'next/server'
import { BusinessOrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const { id } = await params
  try {
    const { status } = await request.json()
    if (![BusinessOrderStatus.CONFIRMED, BusinessOrderStatus.CANCELLED].includes(status)) {
      return NextResponse.json({ error: 'Status must be CONFIRMED or CANCELLED.' }, { status: 400 })
    }
    const order = await prisma.businessOrder.findFirst({
      where: { id, supplierBusiness: { seller: { userId: user.id } } },
      include: { items: true },
    })
    if (!order) return NextResponse.json({ error: 'Wholesale order not found.' }, { status: 404 })
    if (order.status !== BusinessOrderStatus.PENDING) {
      return NextResponse.json({ error: 'Only pending orders can be confirmed or cancelled.' }, { status: 409 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (status === BusinessOrderStatus.CONFIRMED) {
        for (const item of order.items) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, businessId: order.supplierBusinessId, stock: { gte: item.quantity }, isPublished: true, isApproved: true },
            data: { stock: { decrement: item.quantity } },
          })
          if (result.count !== 1) throw new Error('INSUFFICIENT_STOCK')
        }
      }
      return tx.businessOrder.update({ where: { id }, data: { status } })
    })
    return NextResponse.json({ order: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Stock changed before confirmation. The order was not confirmed.' }, { status: 409 })
    }
    console.error('Wholesale order decision failed:', error)
    return NextResponse.json({ error: 'Unable to update wholesale order.' }, { status: 500 })
  }
}
