import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            isApproved: true,
          },
        },
      },
    })

    if (!user || user.isBanned) {
      return NextResponse.json({ error: 'Identifiants invalides ou compte suspendu' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(user.id)

    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        seller: user.seller,
      },
      accessToken,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur connexion'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
