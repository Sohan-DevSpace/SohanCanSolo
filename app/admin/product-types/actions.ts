'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProductType(data: any) {
  const supabase = await createClient()
  
  const { data: pt, error } = await supabase
    .from('product_types')
    .insert([{
      subcategory_id: data.subcategory_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      status: data.status || 'visible',
      supplier_mapping_id: data.supplier_mapping_id || null
    }])
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/product-types')
  revalidatePath('/shop')
  return { success: true, productType: pt }
}

export async function updateProductType(id: string, data: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_types')
    .update({
      subcategory_id: data.subcategory_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      status: data.status,
      supplier_mapping_id: data.supplier_mapping_id || null
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/product-types')
  revalidatePath('/shop')
  return { success: true }
}

export async function deleteProductType(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_types')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/product-types')
  revalidatePath('/shop')
  return { success: true }
}

export async function toggleProductTypeStatus(id: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible'
  
  const { error } = await supabase
    .from('product_types')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/product-types')
  revalidatePath('/shop')
  return { success: true, newStatus }
}
