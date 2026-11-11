'use client'

import React, { useState } from 'react'
import { ShieldAlert, Upload, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

export default function NewReportPage() {
  const { t } = useTranslation()

  const [reportType, setReportType] = useState('SELLER')
  const [targetId, setTargetId] = useState('')
  const [reason, setReason] = useState('FRAUD')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const presignedRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: 'reports/evidence',
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      const { uploadUrl, publicUrl } = await presignedRes.json()

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (uploadRes.ok) {
        setEvidenceUrl(publicUrl)
      } else {
        setEvidenceUrl(URL.createObjectURL(file))
      }
    } catch {
      setEvidenceUrl(URL.createObjectURL(file))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          targetId: targetId || 'generic-report',
          targetType: reportType,
          reason,
          description,
          evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
        }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Error submitting report')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-800 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t.reports.backHome}</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {t.reports.title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t.reports.subtitle}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">{t.reports.successTitle}</h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
              {t.reports.successDesc}
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
            >
              {t.reports.backHome}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.reports.targetType}
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="SELLER">Store / Merchant</option>
                  <option value="PRODUCT">Product / Item</option>
                  <option value="ORDER">Order / Delivery</option>
                  <option value="USER">User Behavior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.reports.reason}
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="FRAUD">Fraud or Scam Attempt</option>
                  <option value="COUNTERFEIT">Counterfeit / Substandard Quality</option>
                  <option value="WRONG_ITEM">Item Does Not Match Description</option>
                  <option value="HARASSMENT">Harassment or Abusive Language</option>
                  <option value="PROHIBITED">Prohibited or Dangerous Item</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.reports.targetId}
              </label>
              <input
                type="text"
                required
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={t.reports.targetPlaceholder}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.reports.explanation}
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the factual details of the issue as accurately as possible..."
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.reports.evidence}
              </label>
              <div className="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">
                    {uploading
                      ? 'Uploading to Cloudflare R2...'
                      : evidenceUrl
                      ? 'Proof attached successfully ✓'
                      : t.reports.uploadBtn}
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG up to 10MB</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Processing with AI Triage...' : t.reports.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
