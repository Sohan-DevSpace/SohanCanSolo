export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          category: string
          base_price: number
          selling_price: number
          stock: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          category: string
          base_price: number
          selling_price: number
          stock?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          category?: string
          base_price?: number
          selling_price?: number
          stock?: number
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          status?: string
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_spend: number
          is_active: boolean
          expiry_date: string | null
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_spend?: number
          is_active?: boolean
          expiry_date?: string | null
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_spend?: number
          is_active?: boolean
          expiry_date?: string | null
        }
      }
    }
  }
}
