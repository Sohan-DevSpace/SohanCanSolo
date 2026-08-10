const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')
const { v2: cloudinary } = require('cloudinary')

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary Environment Credentials in .env!')
  process.exit(1)
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase Credentials in .env!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadToCloudinary(sourceUrlOrFile, folder) {
  if (!sourceUrlOrFile) return null
  if (typeof sourceUrlOrFile === 'string' && sourceUrlOrFile.includes('cloudinary.com')) {
    return sourceUrlOrFile // Already on Cloudinary
  }

  try {
    let target = sourceUrlOrFile

    // Handle relative local file paths like /images/categories/tee_vneck_front_...
    if (typeof sourceUrlOrFile === 'string' && sourceUrlOrFile.startsWith('/')) {
      const localFilePath = path.join(process.cwd(), 'public', sourceUrlOrFile)
      if (fs.existsSync(localFilePath)) {
        target = localFilePath
      } else {
        target = `http://localhost:3000${sourceUrlOrFile}`
      }
    }

    const res = await cloudinary.uploader.upload(target, {
      folder: `alpona/${folder}`,
      resource_type: 'image',
      overwrite: true,
    })
    return res.secure_url
  } catch (err) {
    console.error(`⚠️ Upload failed for [${sourceUrlOrFile}]:`, err.message)
    return null
  }
}

async function runMigration() {
  console.log('🚀 Starting Full Supabase to Cloudinary Image Migration...')
  let totalMigrated = 0

  // 1. Migrate Products (images & gallery_urls)
  console.log('\n📦 1. Migrating Products table...')
  const { data: products } = await supabase.from('products').select('id, name, images, gallery_urls')
  if (products && products.length > 0) {
    for (const prod of products) {
      let updated = false
      const newImages = [...(prod.images || [])]
      const newGallery = [...(prod.gallery_urls || [])]

      for (let i = 0; i < newImages.length; i++) {
        const originalUrl = newImages[i]
        if (originalUrl && !originalUrl.includes('cloudinary.com')) {
          console.log(`   Uploading product image for [${prod.name}]: ${originalUrl}`)
          const cUrl = await uploadToCloudinary(originalUrl, 'products')
          if (cUrl) {
            newImages[i] = cUrl
            updated = true
            totalMigrated++
          }
        }
      }

      for (let i = 0; i < newGallery.length; i++) {
        const originalUrl = newGallery[i]
        if (originalUrl && !originalUrl.includes('cloudinary.com')) {
          console.log(`   Uploading product gallery image for [${prod.name}]: ${originalUrl}`)
          const cUrl = await uploadToCloudinary(originalUrl, 'products')
          if (cUrl) {
            newGallery[i] = cUrl
            updated = true
            totalMigrated++
          }
        }
      }

      if (updated) {
        await supabase.from('products').update({ images: newImages, gallery_urls: newGallery }).eq('id', prod.id)
        console.log(`   ✅ Updated product [${prod.name}] in Supabase DB!`)
      }
    }
  }

  // 2. Migrate Product Variants (image_url)
  console.log('\n🎨 2. Migrating Product Variants table...')
  const { data: variants } = await supabase.from('product_variants').select('id, image_url')
  if (variants && variants.length > 0) {
    for (const variant of variants) {
      if (variant.image_url && !variant.image_url.includes('cloudinary.com')) {
        console.log(`   Uploading variant image [${variant.id}]: ${variant.image_url}`)
        const cUrl = await uploadToCloudinary(variant.image_url, 'products')
        if (cUrl) {
          await supabase.from('product_variants').update({ image_url: cUrl }).eq('id', variant.id)
          console.log(`   ✅ Updated variant [${variant.id}] in Supabase DB!`)
          totalMigrated++
        }
      }
    }
  }

  // 3. Migrate Categories (image_url)
  console.log('\n📂 3. Migrating Categories table...')
  const { data: categories } = await supabase.from('categories').select('id, name, image_url')
  if (categories && categories.length > 0) {
    for (const cat of categories) {
      if (cat.image_url && !cat.image_url.includes('cloudinary.com')) {
        console.log(`   Uploading category image [${cat.name}]: ${cat.image_url}`)
        const cUrl = await uploadToCloudinary(cat.image_url, 'categories')
        if (cUrl) {
          await supabase.from('categories').update({ image_url: cUrl }).eq('id', cat.id)
          console.log(`   ✅ Updated category [${cat.name}] in Supabase DB!`)
          totalMigrated++
        }
      }
    }
  }

  // 4. Migrate Subcategories (image_url)
  console.log('\n📁 4. Migrating Subcategories table...')
  const { data: subcategories } = await supabase.from('subcategories').select('id, name, image_url')
  if (subcategories && subcategories.length > 0) {
    for (const sub of subcategories) {
      if (sub.image_url && !sub.image_url.includes('cloudinary.com')) {
        console.log(`   Uploading subcategory image [${sub.name}]: ${sub.image_url}`)
        const cUrl = await uploadToCloudinary(sub.image_url, 'categories')
        if (cUrl) {
          await supabase.from('subcategories').update({ image_url: cUrl }).eq('id', sub.id)
          console.log(`   ✅ Updated subcategory [${sub.name}] in Supabase DB!`)
          totalMigrated++
        }
      }
    }
  }

  // 5. Migrate Product Types (image_url)
  console.log('\n🏷️ 5. Migrating Product Types table...')
  const { data: productTypes } = await supabase.from('product_types').select('id, name, image_url')
  if (productTypes && productTypes.length > 0) {
    for (const pt of productTypes) {
      if (pt.image_url && !pt.image_url.includes('cloudinary.com')) {
        console.log(`   Uploading product type image [${pt.name}]: ${pt.image_url}`)
        const cUrl = await uploadToCloudinary(pt.image_url, 'categories')
        if (cUrl) {
          await supabase.from('product_types').update({ image_url: cUrl }).eq('id', pt.id)
          console.log(`   ✅ Updated product type [${pt.name}] in Supabase DB!`)
          totalMigrated++
        }
      }
    }
  }

  console.log(`\n🎉 FULL MIGRATION COMPLETE! Total assets migrated to Cloudinary: ${totalMigrated}`)
}

runMigration().catch(err => {
  console.error('❌ Migration Error:', err)
})
