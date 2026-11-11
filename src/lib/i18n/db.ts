/**
 * Database Translation Resolution Engine
 * Resolves entity translations with automatic fallback to English ('en').
 * Enables scalable multi-language support (EN, FR, ES, PT, NL + any future language)
 * without requiring schema changes.
 */

import { Locale, DEFAULT_LOCALE } from './types'

export interface TranslatableEntity {
  name: string
  description?: string | null
  translations?: Array<{
    locale: string
    name: string
    description?: string | null
  }>
}

/**
 * Resolves localized name & description from an entity's translation array.
 * If the requested locale translation doesn't exist, falls back to English ('en'),
 * then to the root entity's default name/description.
 */
export function getLocalizedEntity<T extends TranslatableEntity>(
  entity: T,
  locale: Locale | string = DEFAULT_LOCALE
): { name: string; description: string } {
  if (!entity) {
    return { name: '', description: '' }
  }

  const translations = entity.translations || []

  // 1. Try requested locale
  const match = translations.find(
    (t) => t.locale.toLowerCase() === locale.toLowerCase()
  )
  if (match && match.name) {
    return {
      name: match.name,
      description: match.description || entity.description || '',
    }
  }

  // 2. Try English fallback
  const enMatch = translations.find((t) => t.locale.toLowerCase() === 'en')
  if (enMatch && enMatch.name) {
    return {
      name: enMatch.name,
      description: enMatch.description || entity.description || '',
    }
  }

  // 3. Fallback to entity root fields
  return {
    name: entity.name,
    description: entity.description || '',
  }
}
