import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Connexion requise pour voter' }, { status: 401 })
    }

    const { id: suggestionId } = await params

    const existingVote = await prisma.suggestionVote.findUnique({
      where: {
        suggestionId_userId: {
          suggestionId,
          userId: user.id,
        },
      },
    })

    if (existingVote) {
      // Remove vote (toggle off)
      await prisma.$transaction([
        prisma.suggestionVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.suggestion.update({
          where: { id: suggestionId },
          data: { upvotes: { decrement: 1 } },
        }),
      ])
      return NextResponse.json({ success: true, voted: false })
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.suggestionVote.create({
          data: {
            suggestionId,
            userId: user.id,
          },
        }),
        prisma.suggestion.update({
          where: { id: suggestionId },
          data: { upvotes: { increment: 1 } },
        }),
      ])
      return NextResponse.json({ success: true, voted: true })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur vote'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
