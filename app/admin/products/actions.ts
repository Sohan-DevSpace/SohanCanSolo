'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleProductActive(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ is_active: !currentStatus } as any)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  return { success: true }
}

export async function saveProduct(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const subcategory_id = formData.get('subcategory_id') as string
  const product_type_id = formData.get('product_type_id') as string
  const base_price = parseFloat(formData.get('base_price') as string || '0')
  const selling_price = parseFloat(formData.get('selling_price') as string || '0')
  const compare_at_price_val = formData.get('compare_at_price')
  const compare_at_price = compare_at_price_val ? parseFloat(compare_at_price_val as string) : null
  const qikink_product_id = formData.get('qikink_product_id') as string
  const is_active = formData.get('is_active') === 'true'
  
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  // New detailed fields
  const display_name = formData.get('display_name') as string
  const short_description = formData.get('short_description') as string
  const material_info = formData.get('material_info') as string
  const product_care_info = formData.get('product_care_info') as string
  const is_new_arrival = formData.get('is_new_arrival') === 'true'
  const is_bestseller = formData.get('is_bestseller') === 'true'
  const is_trending = formData.get('is_trending') === 'true'
  
  const highlightsJson = formData.get('product_highlights') as string
  const product_highlights = highlightsJson ? JSON.parse(highlightsJson) : []

  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required' }
  }

  const payload: any = {
    name,
    slug,
    description: description || null,
    category_id: category_id || null,
    subcategory_id: subcategory_id || null,
    product_type_id: product_type_id || null,
    base_price,
    selling_price,
    compare_at_price,
    qikink_product_id: qikink_product_id || null,
    is_active,
    display_name: display_name || null,
    short_description: short_description || null,
    material_info: material_info || null,
    product_care_info: product_care_info || null,
    product_highlights: product_highlights.length > 0 ? product_highlights : null,
    is_new_arrival,
    is_bestseller,
    is_trending,
    ...(images.length > 0 ? { images } : { images: [] }),
  }

  const variantsJson = formData.get('variants') as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []

  let productId = id

  if (id) {
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) return { success: false, error: error.message }
  } else {
    const { data: newProd, error } = await supabase
      .from('products')
      .insert([payload])
      .select('id')
      .single()
    if (error || !newProd) return { success: false, error: error?.message || 'Failed to create product' }
    productId = newProd.id
  }

  // Sync variants
  if (productId && variants.length > 0) {
    const variantsPayload = variants.map((v: any) => ({
      id: v.id || crypto.randomUUID(),
      product_id: productId,
      size: v.size,
      color: v.color,
      color_hex: v.color_hex || null,
      stock: v.stock === '' || v.stock === null || v.stock === undefined ? 999 : (parseInt(v.stock.toString()) || 0),
      qikink_variant_id: v.qikink_variant_id || null,
      image_url: v.image_url || null,
    }))

    const { error: varErr } = await supabase
      .from('product_variants')
      .upsert(variantsPayload)

    if (varErr) return { success: false, error: 'Failed to save variants: ' + varErr.message }
  }

  // Sync designs
  const designIdsJson = formData.get('design_ids') as string
  if (designIdsJson && productId) {
    const designIds: string[] = JSON.parse(designIdsJson)
    
    // First clear existing
    await supabase.from('product_designs').delete().eq('product_id', productId)
    
    // Insert new ones
    if (designIds.length > 0) {
      const designPayload = designIds.map(id => ({ product_id: productId, design_id: id }))
      const { error: desErr } = await supabase.from('product_designs').insert(designPayload)
      if (desErr) return { success: false, error: 'Failed to save designs: ' + desErr.message }
    }
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  return { success: true }
}
