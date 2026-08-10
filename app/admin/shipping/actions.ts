'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveShippingRates(data: {
  domestic_enabled: boolean
  domestic_base_rate: number
  domestic_per_item: number
  domestic_free_threshold: number | null
  international_enabled: boolean
  international_base_rate: number
  international_per_item: number
  estimated_days_min: number
  estimated_days_max: number
  cod_enabled: boolean
  cod_charge: number
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('store_settings').upsert({
    id: 'shipping',
    domestic_enabled: data.domestic_enabled,
    domestic_base_rate: data.domestic_base_rate,
    domestic_per_item: data.domestic_per_item,
    domestic_free_threshold: data.domestic_free_threshold || null,
    international_enabled: data.international_enabled,
    international_base_rate: data.international_base_rate,
    international_per_item: data.international_per_item,
    estimated_days_min: data.estimated_days_min,
    estimated_days_max: data.estimated_days_max,
    cod_enabled: data.cod_enabled,
    cod_charge: data.cod_charge,
    updated_at: new Date().toISOString(),
  })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/shipping')
  return { success: true }
}

export async function getShippingRates() {
  const supabase = await createClient()
  const { data } = await supabase.from('store_settings').select('*').eq('id', 'shipping').single()
  return data
}