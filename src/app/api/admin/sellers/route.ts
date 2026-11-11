import { NextRequest, NextResponse } from 'next/server'
import { VerificationStatus } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['SUPERADMIN', 'ADMIN', 'STORE_MANAGER']

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const rawStatus = searchParams.get('status')
    const status = Object.values(VerificationStatus).includes(rawStatus as VerificationStatus)
      ? rawStatus as VerificationStatus
      : undefined
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const limit = 20

    const [businesses, total] = await prisma.$transaction([
      prisma.businessProfile.findMany({
        where: status ? { verificationStatus: status } : undefined,
        include: {
          seller: {
            include: {
              user: { select: { id: true, name: true, email: true, createdAt: true } },
            },
          },
          verificationApplication: true,
          _count: { select: { products: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.businessProfile.count({ where: status ? { verificationStatus: status } : undefined }),
    ])

    // Keep the existing admin screen response contract while each record now
    // represents a verifiable business rather than the seller's whole account.
    const sellers = businesses.map((business) => ({
      ...business.seller,
      id: business.id,
      businessId: business.id,
      businessName: business.businessName,
      verificationStatus: business.verificationStatus,
      verificationApplication: business.verificationApplication,
      business,
      _count: business._count,
    }))

    return NextResponse.json({ sellers, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin/sellers GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
