import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const suggestions = await prisma.suggestion.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
      take: 50,
    })

    return NextResponse.json({ success: true, suggestions })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur suggestions'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { title, content, category = 'FEATURE_REQUEST' } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 })
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        title,
        content,
        category,
        userId: user?.id || null,
      },
    })

    return NextResponse.json({ success: true, suggestion }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur création suggestion'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
