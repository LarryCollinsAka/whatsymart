'use client'

import React, { useState } from 'react'
import { Lightbulb, ThumbsUp, Plus, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface Suggestion {
  id: string
  title: string
  content: string
  category: string
  status: string
  upvotes: number
  createdAt: string
  user?: { name: string } | null
}

const CATEGORY_KEYS: Record<string, string> = {
  FEATURE_REQUEST: '🚀 Feature Request',
  UX_FEEDBACK: '🎨 UX & Design',
  PRICING: '💰 Pricing & Fees',
  SELLER_TOOLS: '🏪 Vendor Tools',
  OTHER: '💡 Other Ideas',
}

export default function SuggestionsPage() {
  const { t } = useTranslation()

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 'sug-1',
      title: 'SMS delivery notification for customers without data',
      content:
        'Allow buyers who run out of mobile data to receive automated SMS updates with rider phone number.',
      category: 'FEATURE_REQUEST',
      status: 'PLANNED',
      upvotes: 42,
      createdAt: new Date().toISOString(),
      user: { name: 'Sarah Jenkins' },
    },
    {
      id: 'sug-2',
      title: 'Scheduled Saturday morning delivery slots',
      content:
        'Order during the week and select an exact delivery window between 8am and 11am on Saturday.',
      category: 'UX_FEEDBACK',
      status: 'REVIEWED',
      upvotes: 29,
      createdAt: new Date().toISOString(),
      user: { name: 'Marcus Vance' },
    },
    {
      id: 'sug-3',
      title: 'Direct wire transfer auto-reconciliation',
      content:
        'Generate virtual IBAN routing targets for enterprise bulk grain orders.',
      category: 'PRICING',
      status: 'NEW',
      upvotes: 18,
      createdAt: new Date().toISOString(),
      user: { name: 'Elena Ramos' },
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('FEATURE_REQUEST')
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleVote = async (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s))
    )
    try {
      await fetch(`/api/suggestions/${id}/vote`, { method: 'POST' })
    } catch {
      // rollback if needed
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuggestions((prev) => [
          {
            ...data.suggestion,
            upvotes: 1,
            user: { name: 'You' },
          },
          ...prev,
        ])
        setShowModal(false)
        setNewTitle('')
        setNewContent('')
        setMessage('Thank you! Your idea has been published.')
        setTimeout(() => setMessage(null), 4000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered =
    selectedFilter === 'ALL'
      ? suggestions
      : suggestions.filter((s) => s.category === selectedFilter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t.suggestions.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {t.suggestions.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.suggestions.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.suggestions.proposeBtn}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            selectedFilter === 'ALL'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {t.suggestions.allIdeas}
        </button>
        {Object.entries(CATEGORY_KEYS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
              selectedFilter === key
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all"
          >
            {/* Upvote Pill Button */}
            <button
              onClick={() => handleVote(item.id)}
              className="flex flex-col items-center justify-center w-12 sm:w-14 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 transition-all shrink-0 active:scale-95 group"
            >
              <ThumbsUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span className="font-extrabold text-sm sm:text-base mt-0.5">{item.upvotes}</span>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {CATEGORY_KEYS[item.category] || item.category}
                </span>

                {item.status === 'PLANNED' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {t.suggestions.planned}
                  </span>
                )}
                {item.status === 'REVIEWED' && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {t.suggestions.underReview}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base leading-snug">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                {item.content}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 pt-2 border-t border-gray-50">
                <span>{t.suggestions.by} {item.user?.name || 'Community Member'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Suggestion */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-black text-gray-900 mb-1">{t.suggestions.modalTitle}</h2>
            <p className="text-xs text-gray-500 mb-4">{t.suggestions.modalSubtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.suggestions.categoryLabel}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {Object.entries(CATEGORY_KEYS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.suggestions.titleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Live courier tracking on interactive map"
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.suggestions.descLabel}
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your idea and why it brings value..."
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {t.suggestions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : t.suggestions.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
