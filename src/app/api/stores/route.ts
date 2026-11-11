import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(params.get('pageSize')) || DEFAULT_PAGE_SIZE))
  const q = params.get('q')?.trim() || ''
  const country = params.get('country')?.trim() || ''
  const city = params.get('city')?.trim() || ''
  const sort = params.get('sort') || 'recent'

  const where: Prisma.BusinessProfileWhereInput = {
    isActive: true,
    seller: { is: { isApproved: true } },
    ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(q ? {
      OR: [
        { businessName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { products: { some: { isPublished: true, isApproved: true, name: { contains: q, mode: 'insensitive' } } } },
      ],
    } : {}),
  }

  try {
    const orderBy: Prisma.BusinessProfileOrderByWithRelationInput =
      sort === 'name' ? { businessName: 'asc' } : { createdAt: 'desc' }

    const [total, businesses] = await prisma.$transaction([
      prisma.businessProfile.count({ where }),
      prisma.businessProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          seller: {
            select: {
              id: true, storeName: true, storeSlug: true, logoUrl: true,
              whatsappNumber: true, whatsappEnabled: true, isVerified: true, isElite: true,
            },
          },
          locations: {
            where: { isActive: true },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
            take: 1,
            select: { id: true, name: true, address: true, city: true, region: true, country: true, latitude: true, longitude: true, offersDelivery: true, offersPickup: true },
          },
          products: {
            where: { isPublished: true, isApproved: true },
            orderBy: [{ totalSales: 'desc' }, { createdAt: 'desc' }],
            take: 8,
            select: {
              id: true, category: { select: { id: true, name: true, slug: true, emoji: true } },
            },
          },
          _count: {
            select: { products: { where: { isPublished: true, isApproved: true } } },
          },
        },
      }),
    ])

    const stores = businesses.map((business) => {
      const categories = Array.from(
        new Map(business.products.map((product) => [product.category.id, product.category])).values(),
      )

      return {
        id: business.id,
        name: business.businessName,
        slug: business.slug,
        description: business.description,
        logoUrl: business.logoUrl || business.seller.logoUrl,
        bannerUrl: business.bannerUrl,
        isVerified: business.isVerified,
        capabilities: business.capabilities,
        activeProductsCount: business._count.products,
        categories,
        location: business.locations[0] || null,
        seller: {
          id: business.seller.id,
          name: business.seller.storeName,
          slug: business.seller.storeSlug,
          whatsappNumber: business.seller.whatsappEnabled ? business.seller.whatsappNumber : null,
          isVerified: business.seller.isVerified,
          isElite: business.seller.isElite,
        },
        // Ratings, brands and payment methods are intentionally not fabricated;
        // their dedicated, verified data models and workflows are not present yet.
      }
    })

    return NextResponse.json({
      stores,
      pagination: {
        page, pageSize, total,
        totalPages: Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
        hasNextPage: page * pageSize < total,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Store directory query failed:', error)
    return NextResponse.json({ error: 'Unable to load stores right now.' }, { status: 503 })
  }
}
