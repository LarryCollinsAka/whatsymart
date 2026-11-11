import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in to reserve a table.' }, { status: 401 })
  const { id: restaurantId } = await params
  try {
    const body = await request.json()
    const startsAt = new Date(body.startsAt ?? body.reservationAt)
    const endsAt = body.endsAt ? new Date(body.endsAt) : undefined
    const partySize = Number(body.partySize)
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    if (!Number.isFinite(startsAt.getTime()) || startsAt <= new Date()) {
      return NextResponse.json({ error: 'Choose a future reservation date and time.' }, { status: 400 })
    }
    if (endsAt && (!Number.isFinite(endsAt.getTime()) || endsAt <= startsAt)) {
      return NextResponse.json({ error: 'Reservation end time must be later than start time.' }, { status: 400 })
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) return NextResponse.json({ error: 'Party size must be between 1 and 20.' }, { status: 400 })
    if (!customerName || !phone || typeof body.locationId !== 'string') {
      return NextResponse.json({ error: 'Customer name, phone and restaurant branch are required.' }, { status: 400 })
    }
    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { id: restaurantId },
      select: { id: true, businessId: true, acceptsReservations: true },
    })
    if (!restaurant || !restaurant.acceptsReservations) return NextResponse.json({ error: 'Reservations are unavailable.' }, { status: 404 })
    const location = await prisma.businessLocation.findFirst({
      where: { id: body.locationId, businessId: restaurant.businessId, isActive: true },
      select: { id: true },
    })
    if (!location) return NextResponse.json({ error: 'Selected branch is not available.' }, { status: 400 })
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        locationId: location.id,
        customerId: user.id,
        startsAt,
        endsAt,
        partySize,
        customerName: customerName.slice(0, 120),
        phone: phone.slice(0, 40),
        specialRequest: typeof body.specialRequest === 'string' ? body.specialRequest.slice(0, 1000) : null,
      },
    })
    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error) {
    console.error('Restaurant reservation failed:', error)
    return NextResponse.json({ error: 'Unable to create reservation.' }, { status: 500 })
  }
}
