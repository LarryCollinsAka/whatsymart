import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const supplierBusinessId = request.nextUrl.searchParams.get('supplierBusinessId')
  if (!supplierBusinessId) return NextResponse.json({ error: 'supplierBusinessId is required.' }, { status: 400 })
  try {
    const ownedBusiness = await prisma.businessProfile.findFirst({
      where: { id: supplierBusinessId, seller: { userId: user.id } },
      select: { id: true },
    })
    if (!ownedBusiness) return NextResponse.json({ error: 'Supplier business not found.' }, { status: 404 })
    const links = await prisma.supplierRetailer.findMany({
      where: { supplierId: supplierBusinessId },
      include: {
        retailer: {
          select: {
            id: true, businessName: true, slug: true, country: true, city: true,
            seller: { select: { storeName: true, storeSlug: true, isVerified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ retailers: links })
  } catch (error) {
    console.error('Supplier retailer lookup failed:', error)
    return NextResponse.json({ error: 'Unable to load retailer network.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  try {
    const body = await request.json()
    const supplierBusinessId = typeof body.supplierBusinessId === 'string' ? body.supplierBusinessId : ''
    const retailerBusinessId = typeof body.retailerBusinessId === 'string' ? body.retailerBusinessId : ''
    if (!supplierBusinessId || !retailerBusinessId) {
      return NextResponse.json({ error: 'supplierBusinessId and retailerBusinessId are required.' }, { status: 400 })
    }
    const supplier = await prisma.supplierProfile.findFirst({
      where: { businessId: supplierBusinessId, business: { seller: { userId: user.id } } },
      select: { businessId: true },
    })
    if (!supplier) return NextResponse.json({ error: 'Create a supplier profile for this business first.' }, { status: 403 })

    const retailer = await prisma.businessProfile.findFirst({
      where: { id: retailerBusinessId, isActive: true, seller: { isApproved: true } },
      select: { id: true },
    })
    if (!retailer) return NextResponse.json({ error: 'Approved retailer business not found.' }, { status: 404 })
    if (supplier.businessId === retailer.id) return NextResponse.json({ error: 'A business cannot be its own retailer.' }, { status: 400 })

    const link = await prisma.supplierRetailer.upsert({
      where: { supplierId_retailerId: { supplierId: supplier.businessId, retailerId: retailer.id } },
      create: { supplierId: supplier.businessId, retailerId: retailer.id },
      update: {},
    })
    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    console.error('Supplier retailer link creation failed:', error)
    return NextResponse.json({ error: 'Unable to link retailer.' }, { status: 500 })
  }
}
