import { NextResponse } from 'next/server'
import { clearAuthCookies, getCurrentUser } from '@/lib/auth'

export async function POST() {
  await clearAuthCookies()
  return NextResponse.json({ success: true, message: 'Déconnexion réussie' })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null })
  }
  return NextResponse.json({ authenticated: true, user })
}
