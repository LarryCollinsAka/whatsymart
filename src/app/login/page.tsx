'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.user.role === 'SUPERADMIN' || data.user.role === 'ADMIN') {
          router.push('/admin')
        } else if (data.user.role === 'SELLER') {
          router.push('/seller')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill for testing demo
  const fillDemo = (role: 'superadmin' | 'seller' | 'customer') => {
    if (role === 'superadmin') {
      setEmail('superadmin@whatsymart.com')
      setPassword('WhatsyMart2026!')
    } else if (role === 'seller') {
      setEmail('seller@whatsymart.com')
      setPassword('WhatsyMart2026!')
    } else {
      setEmail('customer@whatsymart.com')
      setPassword('WhatsyMart2026!')
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-2xl font-black text-emerald-950">
            Whatsy<span className="text-amber-500">Mart</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t.auth.loginTitle}</h1>
          <p className="text-xs text-gray-500">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? t.auth.loggingIn : t.auth.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-login helpers */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center mb-2 font-medium">
            {t.auth.demoAccountsTitle}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('superadmin')}
              className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
            >
              Superadmin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('seller')}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition"
            >
              Seller
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition"
            >
              Customer
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {t.auth.noAccountYet}{' '}
            <Link href="/register" className="font-bold text-emerald-700 hover:underline">
              {t.auth.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
