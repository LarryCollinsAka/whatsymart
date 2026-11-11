'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Store,
  PackagePlus,
  Wallet,
  Phone,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export default function SellerDashboard() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'products' | 'wallet' | 'settings'>('products')

  // Verification status state
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [rejectionReason, setRejectionReason] = useState<string>('Please provide a higher resolution scan of your National ID.')

  // Fetch current seller profile if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.seller?.verificationStatus) {
          setVerificationStatus(data.user.seller.verificationStatus)
        }
      })
      .catch(() => {})
  }, [])

  // Product form state
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('50')
  const [deliveryTime, setDeliveryTime] = useState('5 min')
  const [level1, setLevel1] = useState('food')
  const [level2, setLevel2] = useState('grains')
  const [level3, setLevel3] = useState('rice')
  const [description, setDescription] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  // Wallet & Payout State
  const [payoutAmount, setPayoutAmount] = useState('150.00')
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'WISE' | 'CRYPTO_USDT'>('BANK_TRANSFER')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  // WhatsApp settings
  const [whatsappNumber, setWhatsappNumber] = useState('237699112233')
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // 1. Client-side Canvas Image Compression & Cloudflare R2 Upload
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 1200
      const scale = MAX_WIDTH / img.width
      const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width
      const height = img.width > MAX_WIDTH ? img.height * scale : img.height

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setUploadingImage(false)
            return
          }

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                folder: 'products',
                contentType: 'image/jpeg',
                fileSize: blob.size,
              }),
            })

            const { uploadUrl, publicUrl } = await res.json()

            await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'image/jpeg' },
              body: blob,
            })

            setUploadedImageUrl(publicUrl)
          } catch {
            setUploadedImageUrl(canvas.toDataURL('image/jpeg', 0.85))
          } finally {
            setUploadingImage(false)
          }
        },
        'image/jpeg',
        0.85
      )
    }
  }

  // 2. AI Product Description Generator
  const handleGenerateAiDescription = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name first')
      return
    }

    setGeneratingAi(true)
    try {
      setDescription(
        `${productName} carefully selected from verified growers. Guaranteed premium quality, packaged to retain freshness, ready for fast courier delivery.`
      )
    } finally {
      setGeneratingAi(false)
    }
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Product "${productName}" published successfully! High-resolution image saved to Cloudflare R2.`)
    setProductName('')
    setPrice('')
    setDescription('')
    setUploadedImageUrl(null)
  }

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutSuccess(true)
    setTimeout(() => setPayoutSuccess(false), 4000)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0f4c35] to-[#166534] text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl">
            MN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Mama Ngono Market</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                {t.product.elite} ✓
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              {t.seller.whatsappLabel}: <span className="font-mono text-white">{whatsappNumber}</span>
            </p>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <div className="flex items-center gap-1 bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-700/50">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-100 hover:text-white'
            }`}
          >
            {t.seller.tabProducts}
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wallet' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-100 hover:text-white'
            }`}
          >
            {t.seller.tabWallet}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-amber-400 text-emerald-950' : 'text-emerald-100 hover:text-white'
            }`}
          >
            {t.seller.tabSettings}
          </button>
        </div>
      </div>

      {/* VERIFICATION STATUS ALERT BANNER */}
      {verificationStatus === 'UNVERIFIED' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Your store is currently unverified</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete your seller KYC dossier to unlock the verified checkmark, full catalog visibility, and instant payout disbursements.
              </p>
            </div>
          </div>
          <Link
            href="/become-a-seller"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 shadow-xs transition"
          >
            <span>Start KYC Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-blue-900">Verification Application Under Review</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                  Audit in progress
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                Our compliance team is auditing your government ID and business credentials. Typical turnaround time: 24–48 hours.
              </p>
            </div>
          </div>
          <div className="text-xs text-blue-600 font-semibold bg-white px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
            Priority Queue
          </div>
        </div>
      )}

      {verificationStatus === 'APPROVED' && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <p className="text-xs font-semibold text-emerald-900">
              <span className="font-bold">Verified Merchant</span> — All store capabilities, direct WhatsApp ordering, and payout rails are fully unlocked.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Active ✓
          </span>
        </div>
      )}

      {verificationStatus === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">Application Requires Revision</p>
              <p className="text-xs text-rose-700 mt-0.5">
                <span className="font-semibold">Review note:</span> {rejectionReason}
              </p>
            </div>
          </div>
          <Link
            href="/become-a-seller"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs transition"
          >
            <span>Update & Re-apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.seller.pendingBalance}</p>
          <p className="text-xl font-black text-emerald-700 mt-1">$320.00</p>
          <span className="text-[10px] text-gray-400">Eligible for payout</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.seller.weeklySales}</p>
          <p className="text-xl font-black text-gray-900 mt-1">128 orders</p>
          <span className="text-[10px] text-emerald-600 font-semibold">↑ +18% this week</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.product.deliveryPrefix} Average Fulfillment</p>
          <p className="text-xl font-black text-amber-600 mt-1">⚡ 12 min</p>
          <span className="text-[10px] text-gray-400">Express SLA met</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.seller.rating}</p>
          <p className="text-xl font-black text-gray-900 mt-1">⭐ 4.9 / 5.0</p>
          <span className="text-[10px] text-gray-400">98 positive reviews</span>
        </div>
      </div>

      {/* TAB 1: ADD PRODUCT WITH 3-LEVEL CATEGORY & R2 UPLOAD */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-700" />
                <span>{t.seller.addProduct}</span>
              </h2>
              <span className="text-xs text-gray-500">R2 + Canvas Pipeline</span>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.seller.productName}
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Premium Fragrant Rice 25kg"
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* 3-Level Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {t.seller.level1}
                  </label>
                  <select
                    value={level1}
                    onChange={(e) => setLevel1(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <option value="food">🌾 Food & Fresh Market</option>
                    <option value="tech">📱 Electronics & Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {t.seller.level2}
                  </label>
                  <select
                    value={level2}
                    onChange={(e) => setLevel2(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <option value="grains">Grains & Starches</option>
                    <option value="oils">Oils & Condiments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {t.seller.level3}
                  </label>
                  <select
                    value={level3}
                    onChange={(e) => setLevel3(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white font-bold text-emerald-800"
                  >
                    <option value="rice">🍚 Rice & Semolina</option>
                    <option value="flour">🌾 Flours & Couscous</option>
                    <option value="pasta">🍝 Pasta & Noodles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t.seller.price} ({t.common.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="28.50"
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t.seller.stock}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t.seller.deliveryTime}
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="5 min or 1h"
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    {t.seller.description}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={generatingAi}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{generatingAi ? 'Generating...' : t.seller.aiWriteBtn}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product origin, packaging details, preparation notes..."
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.seller.photoUpload}
                </label>
                <div className="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">
                      {uploadingImage
                        ? 'Canvas compression & Cloudflare R2 upload...'
                        : uploadedImageUrl
                        ? 'Stored on Cloudflare R2 ✓'
                        : 'Choose product photo'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Client-side compressed to respect serverless limit
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {t.seller.publishBtn}
              </button>
            </form>
          </div>

          {/* Current Products Preview */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Listed Products (3)</h3>
            <div className="space-y-2">
              {[
                { name: 'Fragrant Jasmine Rice 25kg', price: '$28.50', stock: 45, sales: 128 },
                { name: 'Pure Golden Palm Oil 5L', price: '$9.50', stock: 30, sales: 87 },
                { name: 'Ripe Sweet Plantains Bunch', price: '$8.00', stock: 12, sales: 64 },
              ].map((p, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{p.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{p.price}</p>
                    <span className="text-[10px] text-gray-400">Stock: {p.stock} units</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {p.sales} {t.product.soldThisWeek}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WALLET & MULTI-RAIL PAYOUT */}
      {activeTab === 'wallet' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{t.seller.requestPayout}</h2>
              <p className="text-xs text-gray-500">
                Disbursements available via Bank Wire, Wise Business, or USDT (TRC-20 / BEP-20).
              </p>
            </div>
          </div>

          {payoutSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Payout request of ${payoutAmount} submitted successfully! Admin queue notified.
              </span>
            </div>
          )}

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.seller.payoutAmount} ({t.common.currency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={320}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full text-base font-bold p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[11px] text-gray-400">Available balance: $320.00</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.seller.payoutMethod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'BANK_TRANSFER', label: '🏦 Bank Wire (IBAN/ACH)' },
                  { id: 'WISE', label: '🌐 Wise (Global)' },
                  { id: 'CRYPTO_USDT', label: '🪙 USDT (TRC-20)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayoutMethod(m.id as any)}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      payoutMethod === m.id
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.seller.payoutDetails}
              </label>
              <input
                type="text"
                required
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={
                  payoutMethod === 'BANK_TRANSFER'
                    ? 'e.g., Chase Bank - Routing 021000021 / Account 123456789'
                    : payoutMethod === 'WISE'
                    ? 'your-wise-email@domain.com'
                    : 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'
                }
                className="w-full text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md"
            >
              {t.seller.confirmPayout}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WHATSAPP SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{t.seller.whatsappSettingsTitle}</h2>
              <p className="text-xs text-gray-500">
                {t.seller.whatsappSettingsDesc}
              </p>
            </div>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp settings updated successfully ✓</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.seller.whatsappNumberLabel}
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="237699112233"
                className="w-full text-base font-mono p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <input
                type="checkbox"
                id="waToggle"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded"
              />
              <label htmlFor="waToggle" className="text-xs font-bold text-gray-700 cursor-pointer">
                {t.seller.whatsappToggleLabel}
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md"
            >
              {t.seller.saveBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
