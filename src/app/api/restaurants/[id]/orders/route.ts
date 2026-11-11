import { NextRequest, NextResponse } from 'next/server'
import { FulfillmentType, PaymentMethod } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }
const PAYMENT_METHODS = Object.values(PaymentMethod)

export async function POST(request: NextRequest, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to place a restaurant order.' }, { status: 401 })
  const { id: restaurantId } = await params
  try {
    const body = await request.json()
    const fulfillmentType = body.fulfillmentType === FulfillmentType.PICKUP
      ? FulfillmentType.PICKUP
      : body.fulfillmentType === FulfillmentType.DINE_IN
        ? FulfillmentType.DINE_IN
        : FulfillmentType.DELIVERY
    const rawItems = Array.isArray(body.items) ? body.items : []
    if (!rawItems.length || rawItems.length > 40) return NextResponse.json({ error: 'Add between 1 and 40 menu items.' }, { status: 400 })
    if (typeof body.locationId !== 'string') return NextResponse.json({ error: 'Choose a restaurant branch.' }, { status: 400 })
    if (!PAYMENT_METHODS.includes(body.paymentMethod)) return NextResponse.json({ error: 'Choose a valid payment method.' }, { status: 400 })
    if (fulfillmentType === FulfillmentType.DELIVERY && (!body.deliveryAddress || typeof body.deliveryAddress !== 'object')) {
      return NextResponse.json({ error: 'A delivery address is required.' }, { status: 400 })
    }

    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { id: restaurantId },
      select: { id: true, businessId: true, acceptsOrders: true },
    })
    if (!restaurant || !restaurant.acceptsOrders) return NextResponse.json({ error: 'This restaurant is currently unavailable.' }, { status: 404 })
    const location = await prisma.businessLocation.findFirst({
      where: { id: body.locationId, businessId: restaurant.businessId, isActive: true },
      select: { id: true },
    })
    if (!location) return NextResponse.json({ error: 'Selected branch is not available.' }, { status: 400 })

    const quantities = new Map<string, number>()
    for (const item of rawItems) {
      const id = typeof item.menuItemId === 'string' ? item.menuItemId : ''
      const quantity = Number(item.quantity)
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return NextResponse.json({ error: 'Each order item needs a valid menu item and quantity.' }, { status: 400 })
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity)
    }
    const menuItems = await prisma.restaurantMenuItem.findMany({
      where: { id: { in: [...quantities.keys()] }, isAvailable: true, category: { restaurantId } },
      select: { id: true, name: true, price: true, currency: true, locationSettings: { where: { locationId: location.id }, select: { isAvailable: true, price: true } } },
    })
    if (menuItems.length !== quantities.size) return NextResponse.json({ error: 'One or more menu items are unavailable.' }, { status: 400 })
    if (menuItems.some((item) => item.locationSettings[0]?.isAvailable === false)) {
      return NextResponse.json({ error: 'One or more items are unavailable at this branch.' }, { status: 400 })
    }
    const currency = menuItems[0]?.currency || 'USD'
    if (menuItems.some((item) => item.currency !== currency)) return NextResponse.json({ error: 'All items in one restaurant order must use the same currency.' }, { status: 400 })

    const items = menuItems.map((item) => {
      const quantity = quantities.get(item.id)!
      const unitPrice = Number(item.locationSettings[0]?.price ?? item.price)
      return { menuItemId: item.id, itemName: item.name, quantity, unitPrice, total: unitPrice * quantity }
    })
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const order = await prisma.restaurantOrder.create({
      data: {
        restaurantId,
        locationId: location.id,
        customerId: user.id,
        fulfillmentType,
        paymentMethod: body.paymentMethod,
        deliveryAddress: fulfillmentType === FulfillmentType.DELIVERY ? body.deliveryAddress : undefined,
        deliveryFee: 0,
        subtotal,
        total: subtotal,
        currency,
        locale: typeof body.locale === 'string' ? body.locale.slice(0, 5) : 'en',
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : null,
        items: { create: items },
      },
      include: { items: true },
    })
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Restaurant order failed:', error)
    return NextResponse.json({ error: 'Unable to place restaurant order.' }, { status: 500 })
  }
}
