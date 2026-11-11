import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function getSellerBusiness(userId: string, businessId?: string) {
  const seller = await prisma.seller.findUnique({
    where: { userId },
    select: { id: true, businesses: { where: businessId ? { id: businessId } : { isActive: true }, orderBy: { createdAt: 'asc' }, take: 1, select: { id: true } } },
  })
  return seller?.businesses[0] ?? null
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const businessId = request.nextUrl.searchParams.get('businessId') || undefined
  const business = await getSellerBusiness(user.id, businessId)
  if (!business) return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
  const locations = await prisma.businessLocation.findMany({
    where: { businessId: business.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ locations })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  try {
    const body = await request.json()
    const business = await getSellerBusiness(user.id, typeof body.businessId === 'string' ? body.businessId : undefined)
    if (!business) return NextResponse.json({ error: 'Business not found in your account.' }, { status: 404 })
    const required = ['name', 'address', 'city', 'country'] as const
    if (required.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
      return NextResponse.json({ error: 'Name, address, city and country are required.' }, { status: 400 })
    }
    const latitude = Number(body.latitude)
    const longitude = Number(body.longitude)
    if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
      return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 })
    }
    const location = await prisma.businessLocation.create({
      data: {
        businessId: business.id,
        name: body.name.trim().slice(0, 120),
        address: body.address.trim().slice(0, 250),
        city: body.city.trim().slice(0, 120),
        region: typeof body.region === 'string' ? body.region.slice(0, 120) : null,
        country: body.country.trim().slice(0, 120),
        latitude,
        longitude,
        deliveryRadiusKm: Math.min(100, Math.max(0, Number(body.deliveryRadiusKm) || 5)),
        offersDelivery: body.offersDelivery === true,
        offersPickup: body.offersPickup === true,
        openingHours: body.openingHours && typeof body.openingHours === 'object' ? body.openingHours : undefined,
        phone: typeof body.phone === 'string' ? body.phone.slice(0, 40) : null,
        email: typeof body.email === 'string' ? body.email.slice(0, 200) : null,
        isPrimary: Boolean(body.isPrimary),
      },
    })
    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error('Business location creation failed:', error)
    return NextResponse.json({ error: 'Unable to save business location.' }, { status: 500 })
  }
}
