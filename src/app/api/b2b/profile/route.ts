import { NextRequest, NextResponse } from 'next/server'
import { BusinessCapability, BusinessMemberRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const businessId = request.nextUrl.searchParams.get('businessId') || undefined
  const businesses = await prisma.businessProfile.findMany({
    where: { seller: { userId: user.id }, ...(businessId ? { id: businessId } : {}) },
    include: { supplierProfile: true, locations: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ businesses, business: businesses[0] ?? null })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const country = typeof body.country === 'string' ? body.country.trim() : ''
    if (!businessName || !city || !country) {
      return NextResponse.json({ error: 'Business name, city and country are required.' }, { status: 400 })
    }
    const requestedId = typeof body.businessId === 'string' ? body.businessId : undefined
    const baseSlug = slugify(businessName) || 'business'
    const slug = `${baseSlug}-${user.id.slice(-5).toLowerCase()}`

    const business = await prisma.$transaction(async (tx) => {
      const seller = await tx.seller.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          storeName: businessName.slice(0, 120),
          storeSlug: slug,
        },
      })
      const existing = requestedId
        ? await tx.businessProfile.findFirst({ where: { id: requestedId, sellerId: seller.id } })
        : await tx.businessProfile.findFirst({ where: { sellerId: seller.id, slug } })

      const capabilities = [BusinessCapability.WHOLESALE]
      const data = {
        businessName: businessName.slice(0, 180),
        description: typeof body.description === 'string' ? body.description.slice(0, 3000) : null,
        capabilities: [...new Set([...(existing?.capabilities ?? []), ...capabilities])],
        registrationNumber: typeof body.registrationNumber === 'string' ? body.registrationNumber.slice(0, 100) : null,
        taxNumber: typeof body.taxNumber === 'string' ? body.taxNumber.slice(0, 100) : null,
        city: city.slice(0, 120),
        country: country.slice(0, 120),
        address: typeof body.address === 'string' ? body.address.slice(0, 250) : null,
        phone: typeof body.phone === 'string' ? body.phone.slice(0, 40) : null,
        email: typeof body.email === 'string' ? body.email.slice(0, 200) : user.email,
      }
      const saved = existing
        ? await tx.businessProfile.update({ where: { id: existing.id }, data })
        : await tx.businessProfile.create({ data: { sellerId: seller.id, slug, ...data } })
      await tx.businessMembership.upsert({
        where: { businessId_userId: { businessId: saved.id, userId: user.id } },
        update: { role: BusinessMemberRole.OWNER, isActive: true },
        create: { businessId: saved.id, userId: user.id, role: BusinessMemberRole.OWNER },
      })
      return saved
    })
    await prisma.user.update({ where: { id: user.id }, data: { role: 'SELLER' } })
    return NextResponse.json({ business }, { status: 201 })
  } catch (error) {
    console.error('Business profile save failed:', error)
    return NextResponse.json({ error: 'Unable to save business profile.' }, { status: 500 })
  }
}
