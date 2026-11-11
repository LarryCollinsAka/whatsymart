import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role = 'CUSTOMER' } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nom, email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au moins 6 caractères' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cette adresse email' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    // Allowed self-registration roles: CUSTOMER or SELLER
    const assignedRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER'

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

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
      user,
      accessToken,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
