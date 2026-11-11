'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────────
type FormData = {
  // Step 1 — Store Basics (pre-filled from existing seller profile)
  businessName: string
  businessType: string
  businessCountry: string
  businessCity: string
  businessAddress: string
  whatsappNumber: string
  // Step 2 — Document Uploads
  nationalIdUrl: string
  businessRegDocUrl: string
  taxIdUrl: string
  proofOfAddressUrl: string
  selfieWithIdUrl: string
  storeFrontPhotoUrl: string
  // Step 3 — Product & Revenue
  productCategories: string[]
  estimatedMonthlyGmv: string
  hasPhysicalInventory: boolean
  // Step 4 — Social & References
  instagramHandle: string
  facebookPageUrl: string
  referralCode: string
}

const BUSINESS_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual / Freelancer' },
  { value: 'SOLE_TRADER', label: 'Sole Trader' },
  { value: 'LLC', label: 'Limited Liability Company (LLC)' },
  { value: 'CORPORATION', label: 'Corporation / S.A.' },
  { value: 'COOPERATIVE', label: 'Cooperative' },
]

const GMV_RANGES = [
  'Under $500/month',
  '$500 – $2,000/month',
  '$2,000 – $5,000/month',
  '$5,000 – $20,000/month',
  'Over $20,000/month',
]

const PRODUCT_CATEGORIES = [
  'Grains & Starches', 'Meat & Fish', 'Fresh Vegetables', 'Eggs & Dairy',
  'Oils & Condiments', 'Fruits', 'Drinks & Juices', 'Electronics & Accessories',
  'Cosmetics & Beauty', 'Home Services', "Women's Fashion", 'Baby & Kids',
]

const STEPS = [
  { id: 1, label: 'Business Info', icon: '🏢' },
  { id: 2, label: 'Documents', icon: '📄' },
  { id: 3, label: 'Products & Sales', icon: '🛒' },
  { id: 4, label: 'Social & Review', icon: '✅' },
]

// ── Document Upload Component ──────────────────────────────────────────────────
function DocUpload({
  label,
  hint,
  required,
  value,
  onUpload,
  uploading,
}: {
  label: string
  hint: string
  required?: boolean
  value: string
  onUpload: (url: string) => void
  uploading: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localUploading, setLocalUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setLocalUploading(true)
    setError('')
    try {
      // Compress image on canvas if it's an image
      let uploadFile: File | Blob = file
      if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
        const canvas = document.createElement('canvas')
        const img = await createImageBitmap(file)
        const maxDim = 1200
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        uploadFile = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.82))
      }

      // Get presigned URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: (uploadFile as File).type || 'image/jpeg',
          folder: 'sellers/kyc',
        }),
      })
      const { uploadUrl, publicUrl } = await presignRes.json()
      await fetch(uploadUrl, { method: 'PUT', body: uploadFile })
      onUpload(publicUrl)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLocalUploading(false)
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-slate-500">{hint}</p>
      <div
        onClick={() => !localUploading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all
          ${value ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50'}
          ${localUploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {value ? (
          <div className="space-y-2">
            <div className="text-green-600 font-semibold text-sm flex items-center justify-center gap-2">
              <span>✅</span> Uploaded
            </div>
            <img src={value} alt="doc" className="h-20 object-cover rounded-lg mx-auto border border-green-200" />
            <p className="text-xs text-slate-500 truncate">{value.split('/').pop()}</p>
          </div>
        ) : localUploading ? (
          <div className="text-slate-500 text-sm py-2">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mb-1" />
            <p>Uploading…</p>
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-2">
            <div className="text-3xl mb-1">📁</div>
            <p className="font-medium">Click to upload</p>
            <p className="text-xs">JPG, PNG, PDF up to 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BecomeASellerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const uploading = false

  const [form, setForm] = useState<FormData>({
    businessName: '',
    businessType: 'SOLE_TRADER',
    businessCountry: '',
    businessCity: '',
    businessAddress: '',
    whatsappNumber: '',
    nationalIdUrl: '',
    businessRegDocUrl: '',
    taxIdUrl: '',
    proofOfAddressUrl: '',
    selfieWithIdUrl: '',
    storeFrontPhotoUrl: '',
    productCategories: [],
    estimatedMonthlyGmv: GMV_RANGES[0],
    hasPhysicalInventory: true,
    instagramHandle: '',
    facebookPageUrl: '',
    referralCode: '',
  })

  const set = useCallback((key: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      productCategories: prev.productCategories.includes(cat)
        ? prev.productCategories.filter((c) => c !== cat)
        : [...prev.productCategories, cat],
    }))
  }

  const canNext = () => {
    if (step === 1) return form.businessName && form.businessType && form.businessCountry && form.businessCity && form.businessAddress && form.whatsappNumber
    if (step === 2) return !!form.nationalIdUrl && !!form.selfieWithIdUrl
    if (step === 3) return form.productCategories.length > 0 && !!form.estimatedMonthlyGmv
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Submission failed'); return }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-2xl p-10 border border-green-100">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-600 mb-6">We've received your seller verification application. Our team will review it within <strong>24–48 hours</strong> and notify you by email.</p>
          <div className="bg-green-50 rounded-2xl p-4 text-sm text-green-800 mb-6 border border-green-200">
            📧 Check your email for a confirmation message
          </div>
          <button onClick={() => router.push('/seller')} className="w-full py-3 bg-gradient-to-r from-[#0f4c35] to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition">
            Go to Dashboard →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <span className="text-4xl">🏪</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Seller Verification</h1>
          <p className="text-slate-600 mt-1">Complete your profile to start selling on WhatsyMart</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex flex-col items-center gap-1 px-2 ${step > s.id ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all
                  ${step === s.id ? 'bg-gradient-to-r from-[#0f4c35] to-green-500 text-white shadow-lg scale-110' :
                    step > s.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? 'text-green-700' : 'text-slate-400'}`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-12 mx-1 transition-all ${step > s.id ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* ── Step 1: Business Info ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold text-slate-900">🏢 Business Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business / Store Name <span className="text-red-500">*</span></label>
                  <input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="e.g. Mama Ngono Fresh Market" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business Type <span className="text-red-500">*</span></label>
                  <select value={form.businessType} onChange={(e) => set('businessType', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-white">
                    {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Country <span className="text-red-500">*</span></label>
                  <input value={form.businessCountry} onChange={(e) => set('businessCountry', e.target.value)} placeholder="e.g. Cameroon" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input value={form.businessCity} onChange={(e) => set('businessCity', e.target.value)} placeholder="e.g. Yaoundé" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp Number <span className="text-red-500">*</span></label>
                  <input value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="+237 6XX XXX XXX" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Business Address <span className="text-red-500">*</span></label>
                  <textarea value={form.businessAddress} onChange={(e) => set('businessAddress', e.target.value)} rows={2} placeholder="Street address, neighbourhood, landmarks…" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Documents ─────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📄 Identity & Business Documents</h2>
                <p className="text-sm text-slate-500 mt-1">Required documents are marked with <span className="text-red-500">*</span>. All files are stored securely and only used for verification.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DocUpload required label="National ID / Passport" hint="Clear photo of front of ID or passport bio page" value={form.nationalIdUrl} onUpload={(url) => set('nationalIdUrl', url)} uploading={uploading} />
                <DocUpload required label="Selfie Holding ID" hint="A photo of you holding your ID clearly visible" value={form.selfieWithIdUrl} onUpload={(url) => set('selfieWithIdUrl', url)} uploading={uploading} />
                <DocUpload label="Business Registration" hint="Certificate of incorporation or business licence (if applicable)" value={form.businessRegDocUrl} onUpload={(url) => set('businessRegDocUrl', url)} uploading={uploading} />
                <DocUpload label="Tax ID / TIN Document" hint="Tax Identification Number document" value={form.taxIdUrl} onUpload={(url) => set('taxIdUrl', url)} uploading={uploading} />
                <DocUpload label="Proof of Address" hint="Utility bill or bank statement (less than 3 months old)" value={form.proofOfAddressUrl} onUpload={(url) => set('proofOfAddressUrl', url)} uploading={uploading} />
                <DocUpload label="Storefront / Warehouse Photo" hint="Photo of your physical shop, market stall or storage" value={form.storeFrontPhotoUrl} onUpload={(url) => set('storeFrontPhotoUrl', url)} uploading={uploading} />
              </div>
            </div>
          )}

          {/* ── Step 3: Products & Revenue ────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">🛒 Products & Revenue</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Categories <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-500 mb-3">Select all categories you plan to sell in</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${form.productCategories.includes(cat)
                          ? 'bg-gradient-to-r from-[#0f4c35] to-green-500 text-white border-transparent'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Monthly Revenue <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {GMV_RANGES.map((range) => (
                    <label key={range} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${form.estimatedMonthlyGmv === range ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                      <input type="radio" value={range} checked={form.estimatedMonthlyGmv === range} onChange={() => set('estimatedMonthlyGmv', range)} className="text-green-500" />
                      <span className="text-sm font-medium text-slate-700">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.hasPhysicalInventory ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                <input type="checkbox" checked={form.hasPhysicalInventory} onChange={(e) => set('hasPhysicalInventory', e.target.checked)} className="w-4 h-4 text-green-500 rounded" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">I have physical inventory</p>
                  <p className="text-xs text-slate-500">I stock my own products (not purely dropshipping)</p>
                </div>
              </label>
            </div>
          )}

          {/* ── Step 4: Social & Review ───────────────────────────────────────── */}
          {step === 4 && (
            <div className="p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold text-slate-900">✅ Social Proof & Review</h2>
              <p className="text-sm text-slate-500">Help us verify your online presence (optional but recommended)</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram Handle</label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-400">
                    <span className="px-3 text-slate-400 text-sm bg-slate-50 py-3 border-r border-slate-200">@</span>
                    <input value={form.instagramHandle} onChange={(e) => set('instagramHandle', e.target.value)} placeholder="yourstore" className="flex-1 px-4 py-3 text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Facebook Page URL</label>
                  <input value={form.facebookPageUrl} onChange={(e) => set('facebookPageUrl', e.target.value)} placeholder="https://facebook.com/yourpage" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Referral Code</label>
                  <input value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} placeholder="Enter referral code if you have one" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800">Application Summary</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-slate-500">Business</span><span className="font-medium text-slate-800">{form.businessName || '—'}</span>
                  <span className="text-slate-500">Type</span><span className="font-medium text-slate-800">{BUSINESS_TYPES.find(t => t.value === form.businessType)?.label || '—'}</span>
                  <span className="text-slate-500">Location</span><span className="font-medium text-slate-800">{[form.businessCity, form.businessCountry].filter(Boolean).join(', ') || '—'}</span>
                  <span className="text-slate-500">WhatsApp</span><span className="font-medium text-slate-800">{form.whatsappNumber || '—'}</span>
                  <span className="text-slate-500">Documents</span>
                  <span className="font-medium text-slate-800">
                    {[form.nationalIdUrl, form.selfieWithIdUrl, form.businessRegDocUrl, form.taxIdUrl, form.proofOfAddressUrl, form.storeFrontPhotoUrl].filter(Boolean).length} / 6 uploaded
                  </span>
                  <span className="text-slate-500">Categories</span><span className="font-medium text-slate-800">{form.productCategories.length} selected</span>
                  <span className="text-slate-500">Monthly GMV</span><span className="font-medium text-slate-800">{form.estimatedMonthlyGmv}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                <strong>📋 By submitting, you confirm</strong> that all information and documents provided are accurate and genuine. Submitting false information will result in permanent ban.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
          )}

          {/* Navigation */}
          <div className="px-6 sm:px-8 pb-6 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button disabled={!canNext()} onClick={() => setStep(step + 1)}
                className="flex-1 py-3 bg-gradient-to-r from-[#0f4c35] to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-[#0f4c35] to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting…</>
                ) : '🚀 Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Help */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Questions? <a href="mailto:support@whatsymart.com" className="text-green-600 font-medium hover:underline">Contact Seller Support</a>
        </p>
      </div>
    </main>
  )
}
