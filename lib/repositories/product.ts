import type { SupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { BaseRepository, type PaginatedResult, type PaginationParams } from './base'

// ────────────────────────────────────────────────────────────
// Product Repository — Data Access for Products
// ────────────────────────────────────────────────────────────

/** Shape of a product row from the database */
export interface ProductRow {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  product_type_id: string | null
  base_price: number
  selling_price: number
  images: string[]
  status: 'active' | 'draft' | 'archived'
  is_active: boolean
  is_bestseller: boolean
  is_trending: boolean
  is_new_arrival: boolean
  qikink_product_id: string | null
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

/** Shape of a product variant row */
export interface ProductVariantRow {
  id: string
  product_id: string
  size: string
  color: string
  color_hex: string | null
  stock: number
  qikink_variant_id: string | null
  created_at: string
}

/** Filters for product listing queries */
export interface ProductFilters {
  categorySlug?: string
  productTypeId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  status?: 'active' | 'draft' | 'archived'
  isBestseller?: boolean
  isTrending?: boolean
  isNewArrival?: boolean
  tags?: string[]
}

/** Product with joined relations (for product detail page) */
export interface ProductWithRelations extends ProductRow {
  category?: { id: string; name: string; slug: string } | null
  product_type?: { id: string; name: string } | null
  variants?: ProductVariantRow[]
}

const PRODUCT_LIST_SELECT = `
  id,
  name,
  slug,
  selling_price,
  base_price,
  images,
  status,
  is_bestseller,
  is_trending,
  is_new_arrival,
  tags,
  created_at,
  category:categories(id, name, slug),
  product_type:product_types(id, name)
`

const PRODUCT_DETAIL_SELECT = `
  *,
  category:categories(id, name, slug),
  product_type:product_types(id, name),
  variants:product_variants(
    id, product_id, size, color, color_hex, stock, qikink_variant_id, created_at
  )
`

export class ProductRepository extends BaseRepository<ProductRow> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'products')
  }

  /**
   * Find a product by its URL slug, including variants and relations.
   */
  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    const fetchProduct = async () => {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(PRODUCT_DETAIL_SELECT)
        .eq('slug', slug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw this.handleError(error)
      }

      return data as unknown as ProductWithRelations
    }

    if (process.env.NODE_ENV === 'development') {
      return fetchProduct()
    }

    const getCachedProduct = unstable_cache(
      fetchProduct,
      [`product-detail-${slug}`],
      { tags: ['products', `product-${slug}`], revalidate: 3600 }
    )

    return getCachedProduct()
  }

  /**
   * List products with filtering, pagination, and joined relations.
   */
  async list(
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      ascending = false,
    } = pagination

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select(PRODUCT_LIST_SELECT, { count: 'exact' })
      .is('deleted_at', null)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.eq('status', 'active')
    }

    if (filters.categorySlug) {
      query = query.eq('categories.slug', filters.categorySlug)
    }

    if (filters.productTypeId) {
      query = query.eq('product_type_id', filters.productTypeId)
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('selling_price', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('selling_price', filters.maxPrice)
    }

    if (filters.isBestseller) {
      query = query.eq('is_bestseller', true)
    }

    if (filters.isTrending) {
      query = query.eq('is_trending', true)
    }

    if (filters.isNewArrival) {
      query = query.eq('is_new_arrival', true)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(from, to)

    if (error) throw this.handleError(error)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: (data ?? []) as unknown as ProductWithRelations[],
      meta: { page, limit, total, totalPages, hasMore: page < totalPages },
    }
  }

  /**
   * Get products for the homepage (trending, bestsellers, new arrivals).
   */
  async getFeatured(type: 'trending' | 'bestseller' | 'new_arrival', limit = 8): Promise<ProductWithRelations[]> {
    const fetchFeatured = async () => {
      const filterCol = {
        trending: 'is_trending',
        bestseller: 'is_bestseller',
        new_arrival: 'is_new_arrival',
      }[type]

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(PRODUCT_LIST_SELECT)
        .eq('status', 'active')
        .eq(filterCol, true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw this.handleError(error)
      return (data ?? []) as unknown as ProductWithRelations[]
    }

    if (process.env.NODE_ENV === 'development') {
      return fetchFeatured()
    }

    const getCachedFeatured = unstable_cache(
      fetchFeatured,
      [`featured-products-${type}-${limit}`],
      { tags: ['products', 'featured-products'], revalidate: 3600 }
    )

    return getCachedFeatured()
  }

  /**
   * Get related products (same category, excluding current product).
   */
  async getRelated(
    productId: string,
    categoryId: string | null,
    limit = 4
  ): Promise<ProductWithRelations[]> {
    const fetchRelated = async () => {
      let query = this.supabase
        .from(this.tableName)
        .select(PRODUCT_LIST_SELECT)
        .eq('status', 'active')
        .neq('id', productId)
        .is('deleted_at', null)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw this.handleError(error)
      return (data ?? []) as unknown as ProductWithRelations[]
    }

    if (process.env.NODE_ENV === 'development') {
      return fetchRelated()
    }

    const getCachedRelated = unstable_cache(
      fetchRelated,
      [`related-products-${productId}-${categoryId}-${limit}`],
      { tags: ['products'], revalidate: 3600 }
    )

    return getCachedRelated()
  }

  /**
   * Search products by text query (name, description, tags).
   */
  async search(query: string, limit = 20): Promise<ProductWithRelations[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(PRODUCT_LIST_SELECT)
      .eq('status', 'active')
      .is('deleted_at', null)
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw this.handleError(error)
    return (data ?? []) as unknown as ProductWithRelations[]
  }

  /**
   * Get all product slugs for static generation (sitemap, SSG).
   */
  async getAllSlugs(): Promise<string[]> {
    const fetchSlugs = async () => {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('slug')
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) throw this.handleError(error)
      return (data ?? []).map((p) => p.slug)
    }

    if (process.env.NODE_ENV === 'development') {
      return fetchSlugs()
    }

    const getCachedSlugs = unstable_cache(
      fetchSlugs,
      ['all-product-slugs'],
      { tags: ['products', 'slugs'], revalidate: 3600 }
    )

    return getCachedSlugs()
  }
}
