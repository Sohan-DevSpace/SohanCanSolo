import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColor(id?: string | null) {
  const colors = [
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#a855f7', // purple-500
    '#f97316', // orange-500
    '#06b6d4', // cyan-500
    '#f43f5e', // rose-500
    '#8b5cf6', // violet-500
    '#14b8a6', // teal-500
  ]
  if (!id) return '#ffffff'
  
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length] ?? '#ffffff'
}

// ────────────────────────────────────────────────────────────
// Price Formatting
// ────────────────────────────────────────────────────────────

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Format a number as INR currency.
 * Example: formatPrice(1299) → "₹1,299"
 */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}

/**
 * Format price with symbol prefix (for backward compat).
 * Example: formatPriceSymbol(1299) → "₹1,299"
 */
export function formatPriceSymbol(amount: number, symbol = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN')}`
}

// ────────────────────────────────────────────────────────────
// String Utilities
// ────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Simple pluralization.
 * Example: pluralize(3, 'item') → "3 items"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${word}`
}

/**
 * Safely access an array element with a fallback.
 */
export function safeGet<T>(arr: T[], index: number, fallback: T): T {
  return arr[index] ?? fallback
}

