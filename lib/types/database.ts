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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
          Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          status?: string | null
          created_at?: string
        }
          Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          base_price: number
          selling_price: number
          images: string[]
          is_active: boolean
          qikink_product_id: string | null
          display_name: string | null
          compare_at_price: number | null
          short_description: string | null
          material_info: string | null
          product_care_info: string | null
          product_highlights: string[] | null
          is_new_arrival: boolean
          is_bestseller: boolean
          is_trending: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          base_price: number
          selling_price: number
          images?: string[]
          is_active?: boolean
          qikink_product_id?: string | null
          display_name?: string | null
          compare_at_price?: number | null
          short_description?: string | null
          material_info?: string | null
          product_care_info?: string | null
          product_highlights?: string[] | null
          is_new_arrival?: boolean
          is_bestseller?: boolean
          is_trending?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          base_price?: number
          selling_price?: number
          images?: string[]
          is_active?: boolean
          qikink_product_id?: string | null
          display_name?: string | null
          compare_at_price?: number | null
          short_description?: string | null
          material_info?: string | null
          product_care_info?: string | null
          product_highlights?: string[] | null
          is_new_arrival?: boolean
          is_bestseller?: boolean
          is_trending?: boolean
          created_at?: string
        }
          Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          color_hex: string | null
          stock: number
          qikink_variant_id: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          color_hex?: string | null
          stock?: number
          qikink_variant_id?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          color_hex?: string | null
          stock?: number
          qikink_variant_id?: string | null
          image_url?: string | null
          created_at?: string
        }
          Relationships: []
      }
      designs: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string
          thumbnail_url: string | null
          category_id: string | null
          tags: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url: string
          thumbnail_url?: string | null
          category_id?: string | null
          tags?: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          image_url?: string
          thumbnail_url?: string | null
          category_id?: string | null
          tags?: string[]
          is_active?: boolean
          created_at?: string
        }
          Relationships: []
      }
      product_designs: {
        Row: {
          id: string
          product_id: string
          design_id: string
          preview_image_url: string | null
        }
        Insert: {
          id?: string
          product_id: string
          design_id: string
          preview_image_url?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          design_id?: string
          preview_image_url?: string | null
        }
          Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          design_id: string | null
          variant_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          design_id?: string | null
          variant_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          design_id?: string | null
          variant_id?: string
          quantity?: number
          created_at?: string
        }
          Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          is_default?: boolean
          created_at?: string
        }
          Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          qikink_order_id: string | null
          shipping_address: Json
          subtotal: number
          shipping_charge: number
          total: number
          tracking_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          qikink_order_id?: string | null
          shipping_address: Json
          subtotal: number
          shipping_charge?: number
          total: number
          tracking_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          qikink_order_id?: string | null
          shipping_address?: Json
          subtotal?: number
          shipping_charge?: number
          total?: number
          tracking_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
          Relationships: []
      }
      order_items: {
        Row: {
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
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          design_id?: string | null
          variant_id?: string | null
          product_name: string
          design_name?: string | null
          size?: string | null
          color?: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          design_id?: string | null
          variant_id?: string | null
          product_name?: string
          design_name?: string | null
          size?: string | null
          color?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
        }
          Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          name: string
          slug: string
          category_id: string
          description: string | null
          image_url: string | null
          is_visible: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category_id: string
          description?: string | null
          image_url?: string | null
          is_visible?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category_id?: string
          description?: string | null
          image_url?: string | null
          is_visible?: boolean
          sort_order?: number
          created_at?: string
        }
          Relationships: []
      }
      product_types: {
        Row: {
          id: string
          name: string
          slug: string
          subcategory_id: string
          supplier: string | null
          is_visible: boolean
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subcategory_id: string
          supplier?: string | null
          is_visible?: boolean
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subcategory_id?: string
          supplier?: string | null
          is_visible?: boolean
          description?: string | null
          created_at?: string
        }
          Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string | null
          images: string[]
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment?: string | null
          images?: string[]
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          images?: string[]
          status?: string
          created_at?: string
        }
          Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: string
          value: number
          min_purchase_amount: number
          is_active: boolean
          usage_limit: number | null
          usage_count: number
          expiry_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: string
          value: number
          min_purchase_amount?: number
          is_active?: boolean
          usage_limit?: number | null
          usage_count?: number
          expiry_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: string
          value?: number
          min_purchase_amount?: number
          is_active?: boolean
          usage_limit?: number | null
          usage_count?: number
          expiry_date?: string | null
          created_at?: string
        }
          Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          store_name: string
          contact_email: string
          contact_phone: string
          tax_percentage: number
          updated_at: string
        }
        Insert: {
          id: string
          store_name?: string
          contact_email?: string
          contact_phone?: string
          tax_percentage?: number
          updated_at?: string
        }
        Update: {
          id?: string
          store_name?: string
          contact_email?: string
          contact_phone?: string
          tax_percentage?: number
          updated_at?: string
        }
          Relationships: []
      }
      finance_transactions: {
        Row: {
          id: string
          order_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          amount: number
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          amount?: number
          status?: string
          created_at?: string
        }
          Relationships: []
      }
    }
  }
}
