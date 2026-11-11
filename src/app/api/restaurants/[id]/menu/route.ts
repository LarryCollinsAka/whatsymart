import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params
  try {
    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, businessName: true, slug: true, locations: { where: { isActive: true }, orderBy: { isPrimary: 'desc' } } } },
        menuCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { items: { where: { isAvailable: true }, orderBy: { name: 'asc' } } },
        },
      },
    })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 })
    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Restaurant menu lookup failed:', error)
    return NextResponse.json({ error: 'Unable to load restaurant menu.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const { id } = await params
  try {
    const restaurant = await prisma.restaurantProfile.findFirst({
      where: { id, business: { seller: { userId: user.id } } },
      select: { id: true, businessId: true },
    })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found in your account.' }, { status: 404 })
    const body = await request.json()
    if (body.type === 'category') {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) return NextResponse.json({ error: 'Category name is required.' }, { status: 400 })
      const category = await prisma.restaurantMenuCategory.create({
        data: { restaurantId: id, name: name.slice(0, 100), sortOrder: Math.max(0, Number(body.sortOrder) || 0) },
      })
      return NextResponse.json({ category }, { status: 201 })
    }
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const price = Number(body.price)
    if (!categoryId || !name || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Category, item name and valid price are required.' }, { status: 400 })
    }
    const category = await prisma.restaurantMenuCategory.findFirst({ where: { id: categoryId, restaurantId: id } })
    if (!category) return NextResponse.json({ error: 'Menu category not found.' }, { status: 404 })
    const item = await prisma.restaurantMenuItem.create({
      data: {
        categoryId,
        name: name.slice(0, 160),
        description: typeof body.description === 'string' ? body.description.slice(0, 1000) : null,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.slice(0, 1000) : null,
        price,
        currency: typeof body.currency === 'string' ? body.currency.slice(0, 3).toUpperCase() : 'USD',
        isVegetarian: body.isVegetarian === true,
        isVegan: body.isVegan === true,
        allergens: Array.isArray(body.allergens) ? body.allergens.filter((value: unknown): value is string => typeof value === 'string') : [],
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Restaurant menu update failed:', error)
    return NextResponse.json({ error: 'Unable to save menu entry.' }, { status: 500 })
  }
}
