'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDesign(data: { name: string; image_url: string; category_id?: string; tags?: string[] }) {
  const supabase = await createClient()
  
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  const { data: result, error } = await supabase.from('designs').insert([{
    name: data.name,
    slug,
    image_url: data.image_url,
    thumbnail_url: data.image_url,
    category_id: data.category_id || null,
    tags: data.tags || [],
    is_active: true,
  }]).select('*, category:categories(name)').single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/designs')
  return { success: true, design: result }
}

export async function updateDesign(id: string, data: { name: string; image_url: string; category_id?: string; tags?: string[] }) {
  const supabase = await createClient()

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  const { error } = await supabase.from('designs').update({
    name: data.name,
    slug,
    image_url: data.image_url,
    thumbnail_url: data.image_url,
    category_id: data.category_id || null,
    tags: data.tags || [],
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/designs')
  return { success: true }
}

export async function deleteDesign(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('designs').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/designs')
  return { success: true }
}

export async function toggleDesignStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('designs').update({ is_active: !currentStatus }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/designs')
  return { success: true }
}
