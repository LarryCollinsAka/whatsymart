import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'whatsymart-jwt-super-secret-key-production-change-32char'
)

// Role hierarchy rank
const ROLE_LEVEL: Record<string, number> = {
  CUSTOMER: 1,
  SELLER: 2,
  CUSTOMER_SUPPORT: 3,
  STORE_MANAGER: 4,
  ADMIN: 5,
  SUPERADMIN: 6,
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout')

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('wm_access_token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = (payload.role as string) || 'CUSTOMER'
    const userId = (payload.sub as string) || ''

    // Role-specific constraints
    if (pathname.startsWith('/admin')) {
      const allowed = ['SUPERADMIN', 'ADMIN', 'STORE_MANAGER']
      if (!allowed.includes(userRole)) {
        return new NextResponse(
          JSON.stringify({ error: 'Access restricted to administrators', code: 'FORBIDDEN' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    if (pathname.startsWith('/support')) {
      const allowed = ['SUPERADMIN', 'ADMIN', 'STORE_MANAGER', 'CUSTOMER_SUPPORT']
      if (!allowed.includes(userRole)) {
        return new NextResponse(
          JSON.stringify({ error: 'Access restricted to customer support', code: 'FORBIDDEN' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    if (pathname.startsWith('/seller')) {
      const allowed = ['SUPERADMIN', 'ADMIN', 'SELLER']
      if (!allowed.includes(userRole)) {
        return new NextResponse(
          JSON.stringify({ error: 'Access restricted to registered sellers', code: 'FORBIDDEN' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userId)
    requestHeaders.set('x-user-role', userRole)

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('wm_access_token')
    return response
  }
}

// Support both named and default export for Next.js 16 proxy convention
export default proxy

export const config = {
  matcher: [
    '/admin/:path*',
    '/support/:path*',
    '/seller/:path*',
    '/account/:path*',
    '/checkout/:path*',
  ],
}
