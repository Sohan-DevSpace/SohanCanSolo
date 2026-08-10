'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(data: { name: string; slug: string; description?: string; image_url?: string; is_active: boolean }) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .insert([{
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      is_active: data.is_active,
      status: data.is_active ? 'active' : 'hidden'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true, category }
}

export async function updateCategory(id: string, data: { name: string; slug: string; description?: string; image_url?: string; is_active: boolean }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      is_active: data.is_active,
      status: data.is_active ? 'active' : 'hidden'
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // First verify if any products are using this category to prevent orphans or breaking constraints if RESTRICT is used, 
  // though we have ON DELETE SET NULL on products.
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const newActive = !currentStatus

  const { error } = await supabase
    .from('categories')
    .update({ 
      is_active: newActive,
      status: newActive ? 'active' : 'hidden' 
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}
