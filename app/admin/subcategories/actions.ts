'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSubcategory(data: { category_id: string; name: string; slug: string; description?: string; image_url?: string; status: string }) {
  const supabase = await createClient()

  const { data: subcategory, error } = await supabase
    .from('subcategories')
    .insert([{
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      status: data.status
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/subcategories')
  return { success: true, subcategory }
}

export async function updateSubcategory(id: string, data: { category_id: string; name: string; slug: string; description?: string; image_url?: string; status: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('subcategories')
    .update({
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      status: data.status
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/subcategories')
  return { success: true }
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/subcategories')
  return { success: true }
}

export async function toggleSubcategoryStatus(id: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible'

  const { error } = await supabase
    .from('subcategories')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/subcategories')
  return { success: true }
}
