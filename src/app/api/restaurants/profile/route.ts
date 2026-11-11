import { NextRequest, NextResponse } from 'next/server'
import { BusinessCapability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to manage a restaurant.' }, { status: 401 })
  try {
    const body = await request.json()
    const businessId = typeof body.businessId === 'string' ? body.businessId : undefined
    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
      select: { id: true, businesses: { where: businessId ? { id: businessId } : { isActive: true }, orderBy: { createdAt: 'asc' }, take: 1, select: { id: true, capabilities: true } } },
    })
    const business = seller?.businesses[0]
    if (!business) return NextResponse.json({ error: 'An active business profile is required.' }, { status: 403 })

    const cuisineTypes = Array.isArray(body.cuisineTypes)
      ? body.cuisineTypes.filter((value: unknown): value is string => typeof value === 'string').slice(0, 12)
      : []
    const restaurant = await prisma.$transaction(async (tx) => {
      if (!business.capabilities.includes(BusinessCapability.RESTAURANT)) {
        await tx.businessProfile.update({
          where: { id: business.id },
          data: { capabilities: { push: BusinessCapability.RESTAURANT } },
        })
      }
      return tx.restaurantProfile.upsert({
        where: { businessId: business.id },
        create: {
          businessId: business.id,
          description: typeof body.description === 'string' ? body.description.slice(0, 3000) : null,
          cuisineTypes,
          averagePrepMinutes: Math.min(240, Math.max(1, Number(body.averagePrepMinutes) || 30)),
          acceptsOrders: body.acceptsOrders !== false,
          acceptsReservations: body.acceptsReservations !== false,
        },
        update: {
          description: typeof body.description === 'string' ? body.description.slice(0, 3000) : null,
          cuisineTypes,
          averagePrepMinutes: Math.min(240, Math.max(1, Number(body.averagePrepMinutes) || 30)),
          acceptsOrders: body.acceptsOrders !== false,
          acceptsReservations: body.acceptsReservations !== false,
        },
      })
    })
    return NextResponse.json({ restaurant }, { status: 201 })
  } catch (error) {
    console.error('Restaurant profile save failed:', error)
    return NextResponse.json({ error: 'Unable to save restaurant profile.' }, { status: 500 })
  }
}
