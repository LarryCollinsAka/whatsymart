'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { Locale } from '@/lib/i18n/types'

export interface CategoryItem {
  id: string
  slug: string
  emoji?: string | null
  names: Record<Locale, string>
}

const MULTILINGUAL_CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    slug: 'grains-and-starches',
    emoji: '🌾',
    names: {
      en: 'Grains & Starches',
      fr: 'Céréales & Féculents',
      es: 'Cereales y Féculas',
      pt: 'Cereais e Féculas',
      nl: 'Granen & Zetmeel',
    },
  },
  {
    id: '2',
    slug: 'meat-and-seafood',
    emoji: '🥩',
    names: {
      en: 'Meat & Seafood',
      fr: 'Viandes & Poissons',
      es: 'Carnes y Pescados',
      pt: 'Carnes e Peixes',
      nl: 'Vlees & Vis',
    },
  },
  {
    id: '3',
    slug: 'fresh-vegetables',
    emoji: '🥦',
    names: {
      en: 'Fresh Vegetables',
      fr: 'Légumes Frais',
      es: 'Verduras Frescas',
      pt: 'Legumes Frescos',
      nl: 'Verse Groenten',
    },
  },
  {
    id: '4',
    slug: 'eggs-and-dairy',
    emoji: '🥚',
    names: {
      en: 'Eggs & Dairy',
      fr: 'Œufs & Laiterie',
      es: 'Huevos y Lácteos',
      pt: 'Ovos e Laticínios',
      nl: 'Eieren & Zuivel',
    },
  },
  {
    id: '5',
    slug: 'electronics-and-tech',
    emoji: '📱',
    names: {
      en: 'Electronics & Tech',
      fr: 'Électronique & High-Tech',
      es: 'Electrónica y Tech',
      pt: 'Eletrônicos & Tech',
      nl: 'Elektronica & Tech',
    },
  },
  {
    id: '6',
    slug: 'beauty-and-cosmetics',
    emoji: '💄',
    names: {
      en: 'Beauty & Cosmetics',
      fr: 'Cosmétiques & Beauté',
      es: 'Cosméticos y Belleza',
      pt: 'Cosméticos e Beleza',
      nl: 'Cosmetica & Schoonheid',
    },
  },
  {
    id: '7',
    slug: 'home-services',
    emoji: '🛠️',
    names: {
      en: 'Home Services',
      fr: 'Services Maison',
      es: 'Servicios del Hogar',
      pt: 'Serviços Domésticos',
      nl: 'Huishoudelijke Diensten',
    },
  },
  {
    id: '8',
    slug: 'beverages-and-drinks',
    emoji: '🍹',
    names: {
      en: 'Beverages & Juices',
      fr: 'Boissons & Jus',
      es: 'Bebidas y Jugos',
      pt: 'Bebidas e Sucos',
      nl: 'Dranken & Sappen',
    },
  },
]

function CategoryChipsContent() {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const { locale, t } = useTranslation()

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
            !activeCategory
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>🔥</span>
          <span>{t.common.allDepartments}</span>
        </Link>

        {MULTILINGUAL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug
          const displayName = cat.names[locale] || cat.names.en

          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.emoji && <span className="text-base select-none">{cat.emoji}</span>}
              <span>{displayName}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CategoryChips() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-2 flex items-center gap-2 overflow-x-auto">
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
      }
    >
      <CategoryChipsContent />
    </Suspense>
  )
}
