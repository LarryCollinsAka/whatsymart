import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'whatsymart-jwt-super-secret-key-production-change-32char'
)
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'whatsymart-refresh-super-secret-key-production-change-32char'
)

export const ACCESS_TOKEN_EXPIRY = '15m'
export const REFRESH_TOKEN_EXPIRY = '7d'

export type JWTPayload = {
  sub: string // user ID
  email: string
  role: string
  name: string
}

// ─── Token Generation ────────────────────────────────────────

export async function generateAccessToken(payload: JWTPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_SECRET)
}

export async function generateRefreshToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_SECRET)
}

// ─── Token Verification ──────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return (payload.sub as string) || null
  } catch {
    return null
  }
}

// ─── Cookie Helpers ──────────────────────────────────────────

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set('wm_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })

  cookieStore.set('wm_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth/refresh',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('wm_access_token')
  cookieStore.delete('wm_refresh_token')
}

// ─── Auth Helpers ────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('wm_access_token')?.value
  if (!token) return null

  const payload = await verifyAccessToken(token)
  if (!payload) return null

  try {
    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isBanned: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            isApproved: true,
            isVerified: true,
            isElite: true,
            businesses: {
              select: {
                id: true,
                businessName: true,
                slug: true,
                capabilities: true,
                isActive: true,
                isVerified: true,
                verificationStatus: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    }).then((user) => {
      if (!user?.seller) return user
      const businesses = user.seller.businesses
      const verificationStatus =
        businesses.find((business) => business.verificationStatus === 'PENDING')?.verificationStatus ??
        businesses.find((business) => business.verificationStatus === 'APPROVED')?.verificationStatus ??
        businesses[0]?.verificationStatus ??
        'UNVERIFIED'
      return { ...user, seller: { ...user.seller, verificationStatus } }
    })
  } catch {
    return null
  }
}
