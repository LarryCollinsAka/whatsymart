import { NextRequest, NextResponse } from 'next/server'
import { VerificationStatus } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

const ALLOWED_ROLES = ['SUPERADMIN', 'ADMIN', 'STORE_MANAGER']

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentUser()
    if (!admin || !ALLOWED_ROLES.includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: businessId } = await params
    const body = await req.json()
    const { action, reason, note } = body

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: "action must be 'APPROVE' or 'REJECT'" }, { status: 400 })
    }
    if (action === 'REJECT' && (typeof reason !== 'string' || !reason.trim())) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const business = await prisma.businessProfile.findUnique({
      where: { id: businessId },
      include: {
        seller: { include: { user: true } },
        verificationApplication: true,
      },
    })

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (!business.verificationApplication) {
      return NextResponse.json({ error: 'No verification application found' }, { status: 404 })
    }

    const approved = action === 'APPROVE'
    await prisma.$transaction(async (tx) => {
      await tx.businessProfile.update({
        where: { id: businessId },
        data: {
          verificationStatus: approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
          isVerified: approved,
        },
      })
      await tx.sellerVerification.update({
        where: { businessId },
        data: {
          reviewedBy: admin.id,
          reviewNote: typeof note === 'string' ? note : null,
          rejectionReason: approved ? null : reason.trim(),
          reviewedAt: new Date(),
        },
      })

      const approvedBusinessCount = await tx.businessProfile.count({
        where: {
          sellerId: business.sellerId,
          ...(approved ? {} : { id: { not: businessId } }),
          verificationStatus: VerificationStatus.APPROVED,
        },
      })
      await tx.seller.update({
        where: { id: business.sellerId },
        data: { isApproved: approved || approvedBusinessCount > 0, isVerified: approved || approvedBusinessCount > 0 },
      })
    })

    const emailData = approved
      ? emailTemplates.applicationApproved({
          sellerName: business.seller.user.name,
          storeName: business.businessName,
          storeSlug: business.slug,
        })
      : emailTemplates.applicationRejected({
          sellerName: business.seller.user.name,
          storeName: business.businessName,
          reason: reason.trim(),
        })
    sendEmail({ to: business.seller.user.email, ...emailData }).catch(console.error)

    return NextResponse.json({ success: true, action, businessId, sellerId: business.sellerId })
  } catch (err) {
    console.error('[admin/sellers/[id]/verify POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
