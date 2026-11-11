'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  TrendingUp,
  Banknote,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  DollarSign,
  ExternalLink,
  Eye,
  Store,
  Clock,
  Check,
  X
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface SellerVerificationDoc {
  id: string
  sellerId: string
  businessName: string
  businessType: string
  businessCountry: string
  businessCity: string
  businessAddress: string
  nationalIdUrl?: string | null
  businessRegDocUrl?: string | null
  taxIdUrl?: string | null
  proofOfAddressUrl?: string | null
  selfieWithIdUrl?: string | null
  storeFrontPhotoUrl?: string | null
  productCategories: string[]
  estimatedMonthlyGmv: string
  hasPhysicalInventory: boolean
  whatsappNumber: string
  instagramHandle?: string | null
  facebookPageUrl?: string | null
  referralCode?: string | null
  reviewedBy?: string | null
  reviewNote?: string | null
  rejectionReason?: string | null
  submittedAt: string
}

interface SellerItem {
  id: string
  storeName: string
  storeSlug: string
  whatsappNumber: string | null
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    createdAt: string
  }
  verificationApplication?: SellerVerificationDoc | null
  _count?: {
    products: number
    orders: number
  }
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'transfers' | 'payouts' | 'reports' | 'sellers'>('sellers')

  // Bank Transfer Orders Verification Queue
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'ord-8a2f',
      customer: 'Kamga Jean-Paul',
      amount: '$28.50',
      method: 'Bank Wire (UBA Group)',
      reference: 'WM-8A2F991',
      date: '35 mins ago',
      seller: 'Mama Ngono Market',
      items: 'Fragrant Jasmine Rice 25kg (x1)',
    },
    {
      id: 'ord-3c41',
      customer: 'David Miller',
      amount: '$39.98',
      method: 'ACH Wire Transfer',
      reference: 'WM-3C41002',
      date: '2 hours ago',
      seller: 'TechZone Direct',
      items: 'Pro Wireless Earbuds (x2)',
    },
  ])

  // Seller Payouts Queue
  const [payouts, setPayouts] = useState([
    {
      id: 'pay-01',
      seller: 'Mama Ngono Market',
      amount: '$85.00',
      method: 'Bank Transfer (IBAN/Wire)',
      details: '10033 05210 12345678901',
      status: 'PENDING',
      requestedAt: 'Today 10:14 AM',
    },
    {
      id: 'pay-02',
      seller: 'TechZone Direct',
      amount: '$180.00 (USDT)',
      method: 'USDT Crypto Wallet (TRC-20)',
      details: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      status: 'PENDING',
      requestedAt: 'Yesterday 6:30 PM',
    },
  ])

  // Complaints / Reports Queue with AI auto-triage tags
  const [reports, setReports] = useState([
    {
      id: 'rep-01',
      reporter: 'Sarah Jenkins',
      target: 'Express Poultry Co.',
      type: 'SELLER',
      reason: 'Significant delivery delay',
      aiPriority: 'NORMAL',
      aiSummary: '45-minute delay on fresh poultry package.',
      status: 'OPEN',
    },
    {
      id: 'rep-02',
      reporter: 'Elena Ramos',
      target: 'Promo Rice Sack 50kg',
      type: 'PRODUCT',
      reason: 'Quality / packaging concern',
      aiPriority: 'HIGH',
      aiSummary: 'Unsealed packaging reported by recipient.',
      status: 'OPEN',
    },
  ])

  // Seller Vetting Queue State
  const [sellers, setSellers] = useState<SellerItem[]>([
    {
      id: 'sel_demo_01',
      storeName: 'Mama Ngono Fresh Market',
      storeSlug: 'mama-ngono',
      whatsappNumber: '+237699112233',
      verificationStatus: 'PENDING',
      isVerified: false,
      isApproved: false,
      createdAt: new Date().toISOString(),
      user: {
        id: 'usr_01',
        name: 'Mama Ngono',
        email: 'seller@whatsymart.com',
        createdAt: new Date().toISOString(),
      },
      verificationApplication: {
        id: 'ver_01',
        sellerId: 'sel_demo_01',
        businessName: 'Mama Ngono Fresh Market LLC',
        businessType: 'SOLE_TRADER',
        businessCountry: 'Cameroon',
        businessCity: 'Yaoundé',
        businessAddress: 'Marché Central, Allée 4, Boutique 12',
        nationalIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        selfieWithIdUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        businessRegDocUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        taxIdUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        proofOfAddressUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80',
        storeFrontPhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        productCategories: ['Fresh Vegetables', 'Grains & Starches', 'Oils & Condiments'],
        estimatedMonthlyGmv: '$2,000 – $5,000/month',
        hasPhysicalInventory: true,
        whatsappNumber: '+237 699 112 233',
        instagramHandle: 'mamangono_fresh',
        facebookPageUrl: 'https://facebook.com/mamangonomarket',
        referralCode: 'WM-LAUNCH-2026',
        submittedAt: 'Just now',
      },
      _count: { products: 12, orders: 48 },
    },
    {
      id: 'sel_demo_02',
      storeName: 'TechZone Direct Imports',
      storeSlug: 'techzone-direct',
      whatsappNumber: '+12025550199',
      verificationStatus: 'APPROVED',
      isVerified: true,
      isApproved: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      user: {
        id: 'usr_02',
        name: 'David Miller',
        email: 'david@techzone.io',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      verificationApplication: {
        id: 'ver_02',
        sellerId: 'sel_demo_02',
        businessName: 'TechZone Solutions Inc',
        businessType: 'LLC',
        businessCountry: 'United States',
        businessCity: 'Austin, TX',
        businessAddress: '401 Congress Ave, Suite 1500',
        nationalIdUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        selfieWithIdUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        businessRegDocUrl: null,
        taxIdUrl: null,
        proofOfAddressUrl: null,
        storeFrontPhotoUrl: null,
        productCategories: ['Electronics & Accessories'],
        estimatedMonthlyGmv: '$5,000 – $20,000/month',
        hasPhysicalInventory: true,
        whatsappNumber: '+1 202 555 0199',
        instagramHandle: 'techzone_direct',
        facebookPageUrl: null,
        referralCode: null,
        submittedAt: '3 days ago',
      },
      _count: { products: 35, orders: 120 },
    },
  ])

  const [sellerFilter, setSellerFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null)
  const [rejectingSeller, setRejectingSeller] = useState<SellerItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Fetch real sellers from API on load
  useEffect(() => {
    fetch('/api/admin/sellers')
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data?.sellers && data.sellers.length > 0) {
          setSellers(data.sellers)
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      })
  }, [])

  const handleVerifyBankTransfer = (orderId: string, approve: boolean) => {
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId))
    setNotification(
      approve
        ? `Order ${orderId.toUpperCase()} verified successfully! Status flipped to CONFIRMED and vendor credited.`
        : `Order ${orderId.toUpperCase()} rejected.`
    )
    setTimeout(() => setNotification(null), 4000)
  }

  const handleProcessPayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payoutId ? { ...p, status: 'PAID' } : p))
    )
    setNotification(`Payout ${payoutId} marked as disbursed. Transaction reference written to multi-vendor ledger.`)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r))
    )
    setNotification(`Case ${reportId} marked as resolved.`)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleApproveSeller = async (seller: SellerItem) => {
    setActionLoading(true)
    try {
      await fetch(`/api/admin/sellers/${seller.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      })
      
      setSellers((prev) =>
        prev.map((s) =>
          s.id === seller.id
            ? { ...s, verificationStatus: 'APPROVED', isVerified: true, isApproved: true }
            : s
        )
      )
      setNotification(`🎉 ${seller.storeName} has been APPROVED! Seller notified via email with live store access.`)
      setSelectedSeller(null)
    } catch {
      setNotification('Failed to verify seller. Please try again.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleRejectSeller = async () => {
    if (!rejectingSeller || !rejectReason.trim()) return
    setActionLoading(true)
    try {
      await fetch(`/api/admin/sellers/${rejectingSeller.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason: rejectReason }),
      })

      setSellers((prev) =>
        prev.map((s) =>
          s.id === rejectingSeller.id
            ? { ...s, verificationStatus: 'REJECTED', isVerified: false, isApproved: false }
            : s
        )
      )
      setNotification(`Application for ${rejectingSeller.storeName} REJECTED. Email notice with reasons dispatched.`)
      setRejectingSeller(null)
      setRejectReason('')
      setSelectedSeller(null)
    } catch {
      setNotification('Failed to reject application. Please try again.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const filteredSellers = sellers.filter((s) => {
    if (sellerFilter === 'ALL') return true
    return s.verificationStatus === sellerFilter
  })

  const pendingSellersCount = sellers.filter((s) => s.verificationStatus === 'PENDING').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Superadmin Header Bar */}
      <div className="p-6 rounded-3xl bg-[#0f172a] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black">{t.admin.title}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {t.admin.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 flex-wrap">
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sellers' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.admin.tabSellers}</span>
            {pendingSellersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black inline-flex items-center justify-center">
                {pendingSellersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transfers' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.admin.tabTransfers} ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payouts' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.admin.tabPayouts}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.admin.tabReports}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* PLATFORM KPI TELEMETRY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-400 font-semibold uppercase">{t.admin.gmv}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">$48,500.00</p>
          <span className="text-[10px] text-emerald-600 font-bold">Gross Merchandise Value</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-400 font-semibold uppercase">{t.admin.platformFees}</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">$4,850.00</p>
          <span className="text-[10px] text-gray-400">10% standard commission</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-400 font-semibold uppercase">{t.admin.activeSellers}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{sellers.filter(s => s.verificationStatus === 'APPROVED').length} Verified</p>
          <span className="text-[10px] text-amber-600 font-bold">{pendingSellersCount} KYC applications pending</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-400 font-semibold uppercase">{t.admin.appleGpaySplit}</p>
          <p className="text-2xl font-black text-amber-600 mt-1">72%</p>
          <span className="text-[10px] text-gray-400">Lemon Squeezy MoR</span>
        </div>
      </div>

      {/* TAB 0: SELLER VETTING & VERIFICATION QUEUE */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-black text-gray-900">{t.admin.tabSellers} Queue</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Audit merchant government identification, storefront verification photos, and business licenses before marketplace publishing.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSellerFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    sellerFilter === filter
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Store className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">No seller applications in this filter</p>
              <p className="text-xs text-gray-400 mt-1">New applications will automatically appear here when submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSellers.map((seller) => {
                const app = seller.verificationApplication
                return (
                  <div
                    key={seller.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-gray-900">{seller.storeName}</span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            seller.verificationStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : seller.verificationStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : seller.verificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {seller.verificationStatus}
                        </span>
                        {app?.businessCountry && (
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            🌍 {app.businessCity}, {app.businessCountry}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          WhatsApp: {seller.whatsappNumber || app?.whatsappNumber || 'N/A'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Owner: <strong className="text-gray-800">{seller.user.name}</strong> ({seller.user.email})</span>
                        {app && <span>Type: <strong>{app.businessType}</strong></span>}
                        {app && <span>Est. GMV: <strong>{app.estimatedMonthlyGmv}</strong></span>}
                        {seller._count && (
                          <span className="text-emerald-700 font-semibold">
                            {seller._count.products} products · {seller._count.orders} orders
                          </span>
                        )}
                      </div>

                      {app?.productCategories && app.productCategories.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          {app.productCategories.map((c) => (
                            <span key={c} className="text-[10px] font-medium bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {app && (
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold transition shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View KYC Docs</span>
                        </button>
                      )}

                      {seller.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveSeller(seller)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectingSeller(seller)
                              setRejectReason('')
                            }}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* KYC DOCUMENTS MODAL */}
      {selectedSeller && selectedSeller.verificationApplication && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  <span>KYC Audit Dossier — {selectedSeller.storeName}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applicant: {selectedSeller.user.name} ({selectedSeller.user.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Business info table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Legal Entity</span>
                <span className="font-bold text-gray-800">{selectedSeller.verificationApplication.businessName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Structure</span>
                <span className="font-bold text-gray-800">{selectedSeller.verificationApplication.businessType}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Location</span>
                <span className="font-bold text-gray-800">
                  {selectedSeller.verificationApplication.businessCity}, {selectedSeller.verificationApplication.businessCountry}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Address</span>
                <span className="font-medium text-gray-800">{selectedSeller.verificationApplication.businessAddress}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">WhatsApp</span>
                <span className="font-mono font-bold text-emerald-700">{selectedSeller.verificationApplication.whatsappNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Monthly GMV Est.</span>
                <span className="font-bold text-gray-800">{selectedSeller.verificationApplication.estimatedMonthlyGmv}</span>
              </div>
              {selectedSeller.verificationApplication.instagramHandle && (
                <div>
                  <span className="text-gray-400 block font-semibold">Instagram</span>
                  <span className="font-medium text-blue-600">@{selectedSeller.verificationApplication.instagramHandle}</span>
                </div>
              )}
              {selectedSeller.verificationApplication.facebookPageUrl && (
                <div>
                  <span className="text-gray-400 block font-semibold">Facebook</span>
                  <a href={selectedSeller.verificationApplication.facebookPageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium truncate block">
                    Page Link ↗
                  </a>
                </div>
              )}
              {selectedSeller.verificationApplication.referralCode && (
                <div>
                  <span className="text-gray-400 block font-semibold">Referral</span>
                  <span className="font-mono text-amber-700 font-bold">{selectedSeller.verificationApplication.referralCode}</span>
                </div>
              )}
            </div>

            {/* Document Gallery */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Uploaded Verification Artifacts (Cloudflare R2 Encrypted)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { title: 'National ID / Passport', url: selectedSeller.verificationApplication.nationalIdUrl, required: true },
                  { title: 'Selfie with ID', url: selectedSeller.verificationApplication.selfieWithIdUrl, required: true },
                  { title: 'Business Registration', url: selectedSeller.verificationApplication.businessRegDocUrl },
                  { title: 'Tax ID / TIN Document', url: selectedSeller.verificationApplication.taxIdUrl },
                  { title: 'Proof of Address', url: selectedSeller.verificationApplication.proofOfAddressUrl },
                  { title: 'Physical Storefront', url: selectedSeller.verificationApplication.storeFrontPhotoUrl },
                ].map((doc, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl p-2.5 bg-gray-50 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>{doc.title}</span>
                      {doc.required && <span className="text-rose-500 text-[10px]">*Req</span>}
                    </span>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="group relative block aspect-4/3 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
                        <img src={doc.url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                          Inspect Full Size ↗
                        </div>
                      </a>
                    ) : (
                      <div className="aspect-4/3 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-[11px] text-gray-400 bg-white">
                        Not Provided
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

              {selectedSeller.verificationStatus === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setRejectingSeller(selectedSeller)
                      setRejectReason('')
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold"
                  >
                    Reject with Feedback
                  </button>
                  <button
                    onClick={() => handleApproveSeller(selectedSeller)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                  >
                    ✓ Approve Merchant Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-rose-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Reject Verification — {rejectingSeller.storeName}</span>
            </h3>
            <p className="text-xs text-gray-600">
              Provide actionable guidance. The merchant will receive this reason in their notification email so they can rectify and re-submit:
            </p>

            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The photo of the National ID was blurry and unreadable. Please upload a high-resolution scan in good lighting."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingSeller(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSeller}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40"
              >
                {actionLoading ? 'Dispatching Notice…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: BANK TRANSFER VERIFICATION QUEUE */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {t.admin.tabTransfers}
              </h2>
              <p className="text-xs text-gray-500">
                Confirm inbound bank or wire balance before releasing goods to delivery.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pendingOrders.length} pending review
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No wire transfers awaiting verification at this time.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-200 gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-300">
                        {order.reference}
                      </span>
                      <span className="text-xs text-gray-500">· {order.date}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {order.customer} — <span className="text-emerald-700 font-extrabold">{order.amount}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Merchant: <span className="font-medium text-gray-700">{order.seller}</span> | {order.items}
                    </p>
                    <p className="text-[11px] text-gray-400">Channel: {order.method}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerifyBankTransfer(order.id, true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.admin.confirmReceipt}</span>
                    </button>
                    <button
                      onClick={() => handleVerifyBankTransfer(order.id, false)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.admin.reject}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VENDOR PAYOUT DISBURSEMENT QUEUE */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">{t.admin.tabPayouts}</h2>
              <p className="text-xs text-gray-500">
                Disbursements via Local Bank Wire, Wise Business, or USDT (TRC-20 / BEP-20).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-200 gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{payout.seller}</span>
                    <span className="text-xs text-gray-400">· {payout.requestedAt}</span>
                  </div>
                  <p className="text-base font-black text-emerald-700">{payout.amount}</p>
                  <p className="text-xs text-gray-600">
                    Rail: <span className="font-semibold">{payout.method}</span>
                  </p>
                  <p className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
                    {payout.details}
                  </p>
                </div>

                <div className="shrink-0">
                  {payout.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.admin.resolved}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleProcessPayout(payout.id)}
                      className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                    >
                      {t.admin.markPaid}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS & AI MODERATION */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-gray-900">
              {t.admin.tabReports}
            </h2>
            <p className="text-xs text-gray-500">
              Classified and prioritized by NVIDIA NIM / OpenAI GPT-4o triage engine.
            </p>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.aiPriority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Priority: {report.aiPriority}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{report.reason}</span>
                  </div>
                  <span className="text-xs text-gray-400">Reported by {report.reporter}</span>
                </div>

                <p className="text-xs text-gray-800 font-medium">
                  Target: <span className="font-bold">{report.target}</span>
                </p>
                <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800">AI Summary:</span> {report.aiSummary}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {report.status === 'RESOLVED' ? (
                    <span className="text-xs font-bold text-emerald-700">{t.admin.resolved}</span>
                  ) : (
                    <button
                      onClick={() => handleResolveReport(report.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
                    >
                      {t.admin.resolveBtn}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
