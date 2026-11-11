import { NextRequest, NextResponse } from 'next/server'
import { BusinessCapability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  try {
    const body = await request.json()
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
    if (!companyName) return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })

    const businessId = typeof body.businessId === 'string' ? body.businessId : undefined
    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
      select: { businesses: { where: businessId ? { id: businessId } : { isActive: true }, orderBy: { createdAt: 'asc' }, take: 1, select: { id: true, capabilities: true } } },
    })
    const business = seller?.businesses[0]
    if (!business) return NextResponse.json({ error: 'An active business profile is required.' }, { status: 403 })

    const description = typeof body.description === 'string' ? body.description.slice(0, 3000) : null
    const minimumOrderValue = body.minimumOrderValue == null ? null : Number(body.minimumOrderValue)
    const leadTimeDays = Math.min(365, Math.max(0, Number(body.leadTimeDays) || 3))
    if (minimumOrderValue !== null && (!Number.isFinite(minimumOrderValue) || minimumOrderValue < 0)) {
      return NextResponse.json({ error: 'Minimum order value must be a non-negative number.' }, { status: 400 })
    }

    const supplier = await prisma.$transaction(async (tx) => {
      if (!business.capabilities.includes(BusinessCapability.WHOLESALE)) {
        await tx.businessProfile.update({
          where: { id: business.id },
          data: { capabilities: { push: BusinessCapability.WHOLESALE } },
        })
      }
      return tx.supplierProfile.upsert({
        where: { businessId: business.id },
        create: { businessId: business.id, companyName: companyName.slice(0, 160), description, minimumOrderValue, leadTimeDays },
        update: { companyName: companyName.slice(0, 160), description, minimumOrderValue, leadTimeDays },
      })
    })
    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    console.error('Supplier profile save failed:', error)
    return NextResponse.json({ error: 'Unable to save supplier profile.' }, { status: 500 })
  }
}
