'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: isSeller ? 'SELLER' : 'CUSTOMER',
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (isSeller) {
          router.push('/become-a-seller')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block text-2xl font-black text-emerald-950">
            Whatsy<span className="text-amber-500">Mart</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t.auth.registerTitle}</h1>
          <p className="text-xs text-gray-500">
            {t.auth.registerSubtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.auth.nameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
              {t.auth.phoneLabel}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.phonePlaceholder}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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

          {/* Account type toggle */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeller}
                onChange={(e) => setIsSeller(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span className="text-xs font-bold text-gray-800">
                {t.auth.wantToSell}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? t.auth.registering : t.auth.registerBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {t.auth.alreadyHaveAccount}{' '}
            <Link href="/login" className="font-bold text-emerald-700 hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
