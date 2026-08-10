import type { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository, type PaginatedResult, type PaginationParams } from './base'

// ────────────────────────────────────────────────────────────
// Order Repository — Data Access for Orders & Order Items
// ────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderRow {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  qikink_order_id: string | null
  shipping_address: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  subtotal: number
  shipping_charge: number
  discount_amount: number
  total: number
  tracking_url: string | null
  notes: string | null
  coupon_code: string | null
  gift_wrap: boolean
  payment_method: 'prepaid' | 'cod'
  created_at: string
  updated_at: string | null
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string | null
  design_id: string | null
  variant_id: string | null
  product_name: string
  design_name: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
  design_id_back: string | null
  design_name_back: string | null
}

export interface OrderWithItems extends OrderRow {
  items?: OrderItemRow[]
  profile?: { full_name: string | null; email?: string } | null
}

export interface OrderFilters {
  userId?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  search?: string
}

const ORDER_LIST_SELECT = `
  *,
  profiles(full_name)
`

const ORDER_DETAIL_SELECT = `
  *,
  profiles(full_name),
  order_items(*)
`

export class OrderRepository extends BaseRepository<OrderRow> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'orders')
  }

  /**
   * Get a single order with items, optionally filtered by user.
   */
  async findByIdWithItems(
    orderId: string,
    userId?: string
  ): Promise<OrderWithItems | null> {
    let query = this.supabase
      .from(this.tableName)
      .select(ORDER_DETAIL_SELECT)
      .eq('id', orderId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw this.handleError(error)
    }

    return data as unknown as OrderWithItems
  }

  /**
   * Find order by order number (e.g., "ORD-20260801-00042").
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(ORDER_DETAIL_SELECT)
      .eq('order_number', orderNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw this.handleError(error)
    }

    return data as unknown as OrderWithItems
  }

  /**
   * List orders with filtering and pagination.
   */
  async list(
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<OrderWithItems>> {
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
      .select(ORDER_LIST_SELECT, { count: 'exact' })

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus)
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    if (filters.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%`
      )
    }

    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(from, to)

    if (error) throw this.handleError(error)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: (data ?? []) as unknown as OrderWithItems[],
      meta: { page, limit, total, totalPages, hasMore: page < totalPages },
    }
  }

  /**
   * Get user's orders (customer dashboard).
   */
  async getUserOrders(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<OrderWithItems>> {
    return this.list({ userId }, pagination)
  }

  /**
   * Update order status with timestamp.
   */
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    trackingUrl?: string
  ): Promise<OrderRow> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (trackingUrl !== undefined) {
      updateData.tracking_url = trackingUrl
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw this.handleError(error)
    return data as OrderRow
  }

  /**
   * Get revenue aggregate for a date range.
   */
  async getRevenue(
    dateFrom: string,
    dateTo?: string
  ): Promise<{ total: number; count: number }> {
    let query = this.supabase
      .from(this.tableName)
      .select('total')
      .eq('payment_status', 'paid')
      .neq('status', 'cancelled')
      .gte('created_at', dateFrom)

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error } = await query

    if (error) throw this.handleError(error)

    const orders = data ?? []
    return {
      total: orders.reduce((sum, o) => sum + Number(o.total), 0),
      count: orders.length,
    }
  }

  /**
   * Insert order items for an order.
   */
  async createOrderItems(items: Omit<OrderItemRow, 'id'>[]): Promise<OrderItemRow[]> {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(items as Record<string, unknown>[])
      .select()

    if (error) throw this.handleError(error)
    return (data ?? []) as OrderItemRow[]
  }
}
