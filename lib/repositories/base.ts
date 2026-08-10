import type { SupabaseClient } from '@supabase/supabase-js'

// ────────────────────────────────────────────────────────────
// Base Repository — Data Access Layer Abstraction
// ────────────────────────────────────────────────────────────
// All repositories extend this base to get consistent CRUD,
// pagination, soft delete, and error handling.
// ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: string
  ascending?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
}

export interface RepositoryError {
  code: string
  message: string
  details?: unknown
}

/**
 * Base repository providing shared Supabase data-access patterns.
 *
 * Subclasses define the table name and optionally override methods
 * for domain-specific queries.
 *
 * ```ts
 * class ProductRepository extends BaseRepository<Product> {
 *   constructor(supabase: SupabaseClient) {
 *     super(supabase, 'products')
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<TRow = any> {
  constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tableName: string
  ) {}

  // ── Read ──────────────────────────────────────────

  async findById(id: string, select = '*'): Promise<TRow | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw this.handleError(error)
    }

    return data as unknown as TRow
  }

  async findAll(
    params: PaginationParams = {},
    select = '*',
    filters?: (query: any) => any
  ): Promise<PaginatedResult<TRow>> {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      ascending = false,
    } = params

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query: any = this.supabase
      .from(this.tableName)
      .select(select, { count: 'exact' })

    // Apply custom filters if provided
    if (filters) {
      query = filters(query)
    }

    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(from, to)

    if (error) throw this.handleError(error)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: (data ?? []) as unknown as TRow[],
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  }

  // ── Write ─────────────────────────────────────────

  async create<TInsert = Partial<TRow>>(data: TInsert): Promise<TRow> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single()

    if (error) throw this.handleError(error)
    return result as unknown as TRow
  }

  async update<TUpdate = Partial<TRow>>(id: string, data: TUpdate): Promise<TRow> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw this.handleError(error)
    return result as unknown as TRow
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw this.handleError(error)
    return true
  }

  /**
   * Soft delete — sets `deleted_at` instead of removing the row.
   * Table must have a `deleted_at` column.
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw this.handleError(error)
  }

  // ── Utils ─────────────────────────────────────────

  /**
   * Helper to perform a raw query when the repository methods aren't enough.
   * Use sparingly, primarily for complex joins or aggregation.
   */
  async rawQuery(
    filters: (query: ReturnType<SupabaseClient['from']>) => ReturnType<SupabaseClient['from']>
  ): Promise<any> {
    let query = this.supabase.from(this.tableName)
    query = filters(query) as any
    return await query
  }

  // ── Count ─────────────────────────────────────────

  async count(
    filters?: (query: any) => any
  ): Promise<number> {
    let query: any = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    if (filters) {
      query = filters(query)
    }

    const { count, error } = await query
    if (error) throw this.handleError(error)
    return count ?? 0
  }

  // ── Exists ────────────────────────────────────────

  async exists(column: string, value: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq(column, value)

    if (error) throw this.handleError(error)
    return (count ?? 0) > 0
  }

  // ── Error Handling ────────────────────────────────

  protected handleError(error: { code?: string; message: string; details?: string }): RepositoryError {
    console.error(`[REPO_ERROR] ${this.tableName}:`, {
      code: error.code,
      message: error.message,
      details: error.details,
    })

    return {
      code: error.code || 'DB_ERROR',
      message: error.message,
      details: error.details,
    }
  }
}
