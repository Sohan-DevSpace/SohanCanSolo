'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface FilterState {
  category: string
  subcategory: string
  productType: string
  genders: string[]
  sizes: string[]
  colors: string[]
  minPrice: number
  maxPrice: number
  minRating: number
  minDiscount: number
  sort: string
  page: number
  search: string
}

const DEFAULTS: FilterState = {
  category: 'all',
  subcategory: '',
  productType: '',
  genders: [],
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 5000,
  minRating: 0,
  minDiscount: 0,
  sort: 'best-selling',
  page: 1,
  search: '',
}

export function useFilterParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: FilterState = useMemo(() => ({
    category: searchParams.get('category') || 'all',
    subcategory: searchParams.get('subcategory') || '',
    productType: searchParams.get('type') || '',
    genders: searchParams.get('genders')?.split(',').filter(Boolean) || [],
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 5000,
    minRating: Number(searchParams.get('minRating')) || 0,
    minDiscount: Number(searchParams.get('minDiscount')) || 0,
    sort: searchParams.get('sort') || searchParams.get('sortBy') || 'best-selling',
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
  }), [searchParams])

  const updateURL = useCallback((updates: Partial<FilterState>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString())
    const merged = { ...filters, ...updates }

    const setParam = (key: string, value: string | undefined) => {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    setParam('category', merged.category !== 'all' ? merged.category : undefined)
    setParam('subcategory', merged.subcategory || undefined)
    setParam('type', merged.productType || undefined)
    setParam('genders', merged.genders.length > 0 ? merged.genders.join(',') : undefined)
    setParam('sizes', merged.sizes.length > 0 ? merged.sizes.join(',') : undefined)
    setParam('colors', merged.colors.length > 0 ? merged.colors.join(',') : undefined)
    setParam('minPrice', merged.minPrice > 0 ? String(merged.minPrice) : undefined)
    setParam('maxPrice', merged.maxPrice < 5000 ? String(merged.maxPrice) : undefined)
    setParam('minRating', merged.minRating > 0 ? String(merged.minRating) : undefined)
    setParam('minDiscount', merged.minDiscount > 0 ? String(merged.minDiscount) : undefined)
    setParam('sort', merged.sort !== 'best-selling' ? merged.sort : undefined)

    if (resetPage) {
      params.delete('page')
    } else if (merged.page > 1) {
      params.set('page', String(merged.page))
    } else {
      params.delete('page')
    }

    setParam('search', merged.search || undefined)

    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [searchParams, router, pathname, filters])

  const setCategory = useCallback((cat: string) => updateURL({ category: cat, subcategory: '', productType: '' }), [updateURL])
  const setSubcategory = useCallback((sub: string) => updateURL({ subcategory: sub, productType: '' }), [updateURL])
  const setProductType = useCallback((type: string) => updateURL({ productType: type }), [updateURL])
  const setGenders = useCallback((genders: string[]) => updateURL({ genders }), [updateURL])
  const setSizes = useCallback((sizes: string[]) => updateURL({ sizes }), [updateURL])
  const setColors = useCallback((colors: string[]) => updateURL({ colors }), [updateURL])
  const setPriceRange = useCallback((min: number, max: number) => updateURL({ minPrice: min, maxPrice: max }), [updateURL])
  const setMinRating = useCallback((minRating: number) => updateURL({ minRating }), [updateURL])
  const setMinDiscount = useCallback((minDiscount: number) => updateURL({ minDiscount }), [updateURL])
  const setSort = useCallback((sort: string) => updateURL({ sort }), [updateURL])
  const setPage = useCallback((page: number) => updateURL({ page }, false), [updateURL])
  const setSearch = useCallback((search: string) => updateURL({ search }), [updateURL])

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  const activeFilterCount =
    filters.genders.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.minPrice > DEFAULTS.minPrice || filters.maxPrice < DEFAULTS.maxPrice ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.search ? 1 : 0)

  return {
    filters,
    activeFilterCount,
    setCategory,
    setSubcategory,
    setProductType,
    setGenders,
    setSizes,
    setColors,
    setPriceRange,
    setMinRating,
    setMinDiscount,
    setSort,
    setPage,
    setSearch,
    resetFilters,
    updateURL,
    DEFAULTS,
  }
}
