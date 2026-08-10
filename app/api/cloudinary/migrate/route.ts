import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImageServer } from '@/lib/cloudinary-upload'

export async function POST() {
  try {
    const supabase = await createClient()
    const logs: string[] = []
    let migratedCount = 0

    // 1. Migrate Products (images & gallery_urls)
    const { data: products } = await supabase.from('products').select('id, images, gallery_urls')
    if (products) {
      for (const prod of products) {
        let updated = false
        const newImages = [...(prod.images || [])]
        const newGallery = [...(prod.gallery_urls || [])]

        // Migrate main images array
        for (let i = 0; i < newImages.length; i++) {
          const imgUrl = newImages[i]
          if (imgUrl && !imgUrl.includes('cloudinary.com') && (imgUrl.includes('supabase.co') || imgUrl.startsWith('http'))) {
            try {
              const res = await uploadImageServer(imgUrl, 'products')
              newImages[i] = res.url
              updated = true
              migratedCount++
              logs.push(`Migrated product image (${prod.id}): ${res.url}`)
            } catch (e: any) {
              logs.push(`Failed product image (${prod.id}): ${e.message}`)
            }
          }
        }

        // Migrate gallery_urls array
        for (let i = 0; i < newGallery.length; i++) {
          const imgUrl = newGallery[i]
          if (imgUrl && !imgUrl.includes('cloudinary.com') && (imgUrl.includes('supabase.co') || imgUrl.startsWith('http'))) {
            try {
              const res = await uploadImageServer(imgUrl, 'products')
              newGallery[i] = res.url
              updated = true
              migratedCount++
              logs.push(`Migrated gallery image (${prod.id}): ${res.url}`)
            } catch (e: any) {
              logs.push(`Failed gallery image (${prod.id}): ${e.message}`)
            }
          }
        }

        if (updated) {
          await supabase.from('products').update({ images: newImages, gallery_urls: newGallery }).eq('id', prod.id)
        }
      }
    }

    // 2. Migrate Categories
    const { data: categories } = await supabase.from('categories').select('id, image_url')
    if (categories) {
      for (const cat of categories) {
        if (cat.image_url && !cat.image_url.includes('cloudinary.com') && (cat.image_url.includes('supabase.co') || cat.image_url.startsWith('http'))) {
          try {
            const res = await uploadImageServer(cat.image_url, 'categories')
            await supabase.from('categories').update({ image_url: res.url }).eq('id', cat.id)
            migratedCount++
            logs.push(`Migrated category image (${cat.id}): ${res.url}`)
          } catch (e: any) {
            logs.push(`Failed category image (${cat.id}): ${e.message}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount,
      logs,
    })
  } catch (error: any) {
    console.error('Cloudinary Migration API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
