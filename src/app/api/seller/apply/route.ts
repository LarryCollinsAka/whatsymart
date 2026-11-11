import { NextRequest, NextResponse } from 'next/server'
import { BusinessCapability, BusinessMemberRole, VerificationStatus } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { slugify } from '@/lib/utils'

const VALID_CAPABILITIES = new Set<BusinessCapability>([
  BusinessCapability.RETAIL,
  BusinessCapability.RESTAURANT,
  BusinessCapability.WHOLESALE,
])

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Please sign in to apply to become a seller' }, { status: 401 })

    const body = await req.json()
    const {
      businessName, businessType, businessCountry, businessCity, businessAddress,
      nationalIdUrl, businessRegDocUrl, taxIdUrl, proofOfAddressUrl, selfieWithIdUrl,
      storeFrontPhotoUrl, productCategories, estimatedMonthlyGmv, hasPhysicalInventory,
      whatsappNumber, instagramHandle, facebookPageUrl, referralCode,
    } = body

    if (![businessName, businessType, businessCountry, businessCity, businessAddress].every(
      (value) => typeof value === 'string' && value.trim(),
    )) {
      return NextResponse.json({ error: 'Missing required business information' }, { status: 400 })
    }
    if (typeof whatsappNumber !== 'string' || !whatsappNumber.trim()) {
      return NextResponse.json({ error: 'WhatsApp number is required' }, { status: 400 })
    }
    if (!nationalIdUrl || !selfieWithIdUrl) {
      return NextResponse.json({ error: 'National ID / Passport scan and selfie with ID are required' }, { status: 400 })
    }

    const requestedCapabilities: BusinessCapability[] = Array.isArray(body.capabilities)
      ? body.capabilities.filter((value: unknown): value is BusinessCapability =>
          typeof value === 'string' && VALID_CAPABILITIES.has(value as BusinessCapability),
        )
      : [BusinessCapability.RETAIL]
    const capabilities = [...new Set(requestedCapabilities.length ? requestedCapabilities : [BusinessCapability.RETAIL])]

    const baseSlug = slugify(businessName) || 'business'
    const businessSlug = `${baseSlug}-${user.id.slice(-5).toLowerCase()}`

    const result = await prisma.$transaction(async (tx) => {
      const seller = await tx.seller.upsert({
        where: { userId: user.id },
        update: {
          whatsappNumber: whatsappNumber.trim(),
        },
        create: {
          userId: user.id,
          storeName: businessName.trim(),
          storeSlug: `${baseSlug}-${user.id.slice(-5).toLowerCase()}`,
          whatsappNumber: whatsappNumber.trim(),
          isApproved: false,
          isVerified: false,
        },
      })

      const existingBusiness = await tx.businessProfile.findUnique({
        where: { slug: businessSlug },
        select: { id: true, verificationStatus: true },
      })

      if (existingBusiness?.verificationStatus === VerificationStatus.PENDING) {
        throw new Error('APPLICATION_ALREADY_PENDING')
      }
      if (existingBusiness?.verificationStatus === VerificationStatus.APPROVED) {
        throw new Error('BUSINESS_ALREADY_APPROVED')
      }

      const business = existingBusiness
        ? await tx.businessProfile.update({
            where: { id: existingBusiness.id },
            data: {
              businessName: businessName.trim(),
              capabilities,
              country: businessCountry.trim(),
              city: businessCity.trim(),
              address: businessAddress.trim(),
              phone: whatsappNumber.trim(),
              verificationStatus: VerificationStatus.PENDING,
              isVerified: false,
            },
          })
        : await tx.businessProfile.create({
            data: {
              sellerId: seller.id,
              businessName: businessName.trim(),
              slug: businessSlug,
              capabilities,
              country: businessCountry.trim(),
              city: businessCity.trim(),
              address: businessAddress.trim(),
              phone: whatsappNumber.trim(),
              verificationStatus: VerificationStatus.PENDING,
            },
          })

      await tx.businessMembership.upsert({
        where: { businessId_userId: { businessId: business.id, userId: user.id } },
        update: { role: BusinessMemberRole.OWNER, isActive: true },
        create: { businessId: business.id, userId: user.id, role: BusinessMemberRole.OWNER },
      })

      const verification = await tx.sellerVerification.upsert({
        where: { businessId: business.id },
        update: {
          businessName: businessName.trim(),
          businessType: businessType.trim(),
          businessCountry: businessCountry.trim(),
          businessCity: businessCity.trim(),
          businessAddress: businessAddress.trim(),
          nationalIdUrl,
          businessRegDocUrl: businessRegDocUrl || null,
          taxIdUrl: taxIdUrl || null,
          proofOfAddressUrl: proofOfAddressUrl || null,
          selfieWithIdUrl,
          storeFrontPhotoUrl: storeFrontPhotoUrl || null,
          productCategories: Array.isArray(productCategories) ? productCategories.filter((v: unknown): v is string => typeof v === 'string') : [],
          estimatedMonthlyGmv: typeof estimatedMonthlyGmv === 'string' ? estimatedMonthlyGmv : 'Not provided',
          hasPhysicalInventory: typeof hasPhysicalInventory === 'boolean' ? hasPhysicalInventory : true,
          whatsappNumber: whatsappNumber.trim(),
          instagramHandle: instagramHandle || null,
          facebookPageUrl: facebookPageUrl || null,
          referralCode: referralCode || null,
          reviewedBy: null,
          reviewNote: null,
          rejectionReason: null,
          reviewedAt: null,
          submittedAt: new Date(),
        },
        create: {
          businessId: business.id,
          businessName: businessName.trim(),
          businessType: businessType.trim(),
          businessCountry: businessCountry.trim(),
          businessCity: businessCity.trim(),
          businessAddress: businessAddress.trim(),
          nationalIdUrl,
          businessRegDocUrl: businessRegDocUrl || null,
          taxIdUrl: taxIdUrl || null,
          proofOfAddressUrl: proofOfAddressUrl || null,
          selfieWithIdUrl,
          storeFrontPhotoUrl: storeFrontPhotoUrl || null,
          productCategories: Array.isArray(productCategories) ? productCategories.filter((v: unknown): v is string => typeof v === 'string') : [],
          estimatedMonthlyGmv: typeof estimatedMonthlyGmv === 'string' ? estimatedMonthlyGmv : 'Not provided',
          hasPhysicalInventory: typeof hasPhysicalInventory === 'boolean' ? hasPhysicalInventory : true,
          whatsappNumber: whatsappNumber.trim(),
          instagramHandle: instagramHandle || null,
          facebookPageUrl: facebookPageUrl || null,
          referralCode: referralCode || null,
        },
      })

      await tx.user.update({ where: { id: user.id }, data: { role: 'SELLER' } })
      return { seller, business, verification }
    })

    sendEmail({
      to: user.email,
      ...emailTemplates.applicationReceived({ sellerName: user.name, storeName: result.business.businessName }),
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      businessId: result.business.id,
      verificationId: result.verification.id,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'APPLICATION_ALREADY_PENDING') {
      return NextResponse.json({ error: 'Your application is already under review' }, { status: 409 })
    }
    if (err instanceof Error && err.message === 'BUSINESS_ALREADY_APPROVED') {
      return NextResponse.json({ error: 'This business is already verified' }, { status: 409 })
    }
    console.error('[seller/apply]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
