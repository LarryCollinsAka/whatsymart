import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE_DEFAULT = 12
const PAGE_SIZE_MAX = 48

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(params.get('pageSize')) || PAGE_SIZE_DEFAULT))
  const q = params.get('q')?.trim() || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'popular'
  const locale = params.get('locale') || 'en'

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    isApproved: true,
    business: { is: { isActive: true, seller: { is: { isApproved: true } } } },
    ...(category && category !== 'all' ? { category: { slug: category } } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { business: { businessName: { contains: q, mode: 'insensitive' } } },
        { translations: { some: { locale, OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ] } } },
      ],
    } : {}),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = sort === 'priceAsc'
    ? { price: 'asc' }
    : sort === 'priceDesc'
      ? { price: 'desc' }
      : { totalSales: 'desc' }

  try {
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: [orderBy, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          business: {
            select: {
              id: true, businessName: true, slug: true, isVerified: true,
              seller: { select: { id: true, storeName: true, storeSlug: true, whatsappNumber: true, isElite: true, isVerified: true } },
            },
          },
          category: { select: { name: true, slug: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
          translations: { where: { locale }, take: 1 },
        },
      }),
    ])

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        name: product.translations[0]?.name || product.name,
        slug: product.slug,
        description: product.translations[0]?.description || product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        currency: product.currency,
        stock: product.stock,
        totalSales: product.totalSales,
        weekSales: product.weekSales,
        deliveryTime: product.deliveryTime,
        badge: product.badge,
        imageUrl: product.images[0]?.r2Url || null,
        category: product.category,
        seller: { ...product.business.seller, businessId: product.business.id, businessName: product.business.businessName, businessSlug: product.business.slug },
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
        hasNextPage: page * pageSize < total,
      },
    })
  } catch (error) {
    console.error('Product catalogue query failed:', error)
    return NextResponse.json({ error: 'Unable to load products. Check the database connection and product seed data.' }, { status: 503 })
  }
}
