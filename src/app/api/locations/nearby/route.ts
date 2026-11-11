import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  const radiusKm = Math.min(100, Math.max(1, Number(params.get('radiusKm')) || 15))
  const type = params.get('type') || 'all'
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 })
  }
  try {
    const locations = await prisma.businessLocation.findMany({
      where: {
        isActive: true,
        business: {
          is: {
            isActive: true,
            seller: { is: { isApproved: true } },
            ...(type === 'restaurants' ? { restaurantProfile: { isNot: null } } : {}),
          },
        },
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            capabilities: true,
            seller: { select: { id: true, storeName: true, storeSlug: true, isVerified: true, whatsappNumber: true, isElite: true } },
            restaurantProfile: {
              select: { id: true, cuisineTypes: true, acceptsOrders: true, averagePrepMinutes: true },
            },
          },
        },
      },
      take: 500,
    })
    const nearby = locations.map((location) => ({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      region: location.region,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      deliveryRadiusKm: location.deliveryRadiusKm,
      offersDelivery: location.offersDelivery,
      offersPickup: location.offersPickup,
      business: location.business,
      distanceKm: distanceKm(lat, lng, location.latitude, location.longitude),
    })).filter((location) => location.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm)
    return NextResponse.json({ locations: nearby, search: { latitude: lat, longitude: lng, radiusKm, type } })
  } catch (error) {
    console.error('Nearby location lookup failed:', error)
    return NextResponse.json({ error: 'Unable to search nearby locations.' }, { status: 503 })
  }
}
