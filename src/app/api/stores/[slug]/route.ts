import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const business = await prisma.businessProfile.findFirst({
      where: { slug, isActive: true, seller: { is: { isApproved: true } } },
      include: {
        seller: {
          select: { id: true, storeName: true, storeSlug: true, logoUrl: true, whatsappNumber: true, whatsappEnabled: true, isVerified: true, isElite: true },
        },
        locations: {
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          select: { id: true, name: true, address: true, city: true, region: true, country: true, latitude: true, longitude: true, offersDelivery: true, offersPickup: true },
        },
        products: {
          where: { isPublished: true, isApproved: true },
          orderBy: [{ totalSales: 'desc' }, { createdAt: 'desc' }],
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
            translations: { where: { locale: 'en' }, take: 1 },
          },
        },
      },
    })
    if (!business) return NextResponse.json({ error: 'Store not found.' }, { status: 404 })

    return NextResponse.json({
      store: {
        id: business.id,
        name: business.businessName,
        slug: business.slug,
        description: business.description,
        logoUrl: business.logoUrl || business.seller.logoUrl,
        bannerUrl: business.bannerUrl,
        country: business.country,
        city: business.city,
        capabilities: business.capabilities,
        isVerified: business.isVerified,
        locations: business.locations,
        products: business.products.map((product) => ({
          id: product.id,
          name: product.translations[0]?.name || product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          stock: product.stock,
          deliveryTime: product.deliveryTime,
          badge: product.badge,
          weekSales: product.weekSales,
          imageUrl: product.images[0]?.r2Url || null,
          seller: {
            id: business.seller.id,
            storeName: business.businessName,
            storeSlug: business.seller.storeSlug,
            businessSlug: business.slug,
            whatsappNumber: business.seller.whatsappEnabled ? business.seller.whatsappNumber : null,
            isElite: business.seller.isElite,
            isVerified: business.isVerified,
          },
        })),
        seller: {
          name: business.seller.storeName,
          whatsappNumber: business.seller.whatsappEnabled ? business.seller.whatsappNumber : null,
        },
        // No ratings are shown until review collection and moderation exist.
      },
    })
  } catch (error) {
    console.error('Store detail query failed:', error)
    return NextResponse.json({ error: 'Unable to load this store.' }, { status: 503 })
  }
}
