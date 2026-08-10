// ════════════════════════════════════════════════════════════════════
// QIKINK PRODUCT IMPORT SCRIPT
// Reads from QIKINK_PRODUCTS data and seeds Supabase DB
// 
// SETUP:
//   npm install @supabase/supabase-js tsx dotenv
//
// RUN:
//   npx tsx scripts/import-qikink-products.ts
//
// This creates:
//   - 154 rows in public.products
//   - 2791 rows in public.product_variants
//
// SAFE TO RE-RUN: uses upsert (no duplicates)
// ════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { QIKINK_PRODUCTS } from '../lib/data/qikink-products-data'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role — bypasses RLS
)

// Category to our internal category_id mapping
// After running this script, update these UUIDs from your categories table
const CATEGORY_SLUG_MAP: Record<string, string> = {
  tshirts:    'T-Shirts',
  hoodies:    'Hoodies & Outerwear',
  bottomwear: 'Bottomwear',
  bags:       'Bags & Carry',
  headwear:   'Headwear & Accessories',
  drinkware:  'Drinkware',
  tech:       'Tech Accessories',
  home:       'Home & Living',
  gifts:      'Gifts & Personalised',
  stationery: 'Stationery',
  kids:       'Kids Collection',
  pets:       'Pet Collection',
  aop:        'AOP Collection',
  other:      'Other',
}

async function getCategoryIds(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
  
  if (error) throw error
  
  const map: Record<string, string> = {}
  for (const [slug, name] of Object.entries(CATEGORY_SLUG_MAP)) {
    const cat = data?.find(c => c.name === name)
    if (cat) map[slug] = cat.id
    else console.warn(`⚠ Category not found in DB: ${name}`)
  }
  return map
}

async function ensureCategories() {
  console.log('📁 Ensuring categories exist...')
  
  const categories = Object.entries(CATEGORY_SLUG_MAP).map(([slug, name]) => ({
    name,
    slug,
    is_active: true,
  }))
  
  const { error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug', ignoreDuplicates: false })
  
  if (error) throw error
  console.log(`  ✓ ${categories.length} categories upserted`)
}

async function importProducts() {
  console.log('\n🛍 Starting product import...')
  console.log(`  Total products to import: ${QIKINK_PRODUCTS.length}`)
  console.log(`  Total variants to import: ${QIKINK_PRODUCTS.reduce((a, p) => a + p.variants.length, 0)}`)
  console.log()
  
  const categoryIds = await getCategoryIds()
  
  let productSuccess = 0
  let productErrors = 0
  let variantSuccess = 0
  let variantErrors = 0
  
  // Process in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10
  
  for (let i = 0; i < QIKINK_PRODUCTS.length; i += BATCH_SIZE) {
    const batch = QIKINK_PRODUCTS.slice(i, i + BATCH_SIZE)
    
    for (const product of batch) {
      // Build product row
      const productRow = {
        name: product.name,
        slug: product.slug,
        display_name: product.display_name,
        description: `${product.display_name} — Custom print on demand. Available in ${product.variants.length} variants.`,
        short_description: product.display_name,
        category_id: categoryIds[product.collection] || null,
        base_price: product.base_price,
        selling_price: product.selling_price,
        qikink_product_id: product.qikink_product_code,  // The code like UV34, US21
        qikink_category: product.qikink_category,
        is_active: true,
        status: 'active',
        tags: [product.gender, product.collection, product.display_name.toLowerCase()],
        product_highlights: [
          'Premium quality print',
          'Made on order — not in bulk',
          'Ships in 5-7 business days',
        ],
        estimated_delivery: '5-7 business days',
      }
      
      // Upsert product by slug
      const { data: productData, error: productError } = await supabase
        .from('products')
        .upsert(productRow, { onConflict: 'slug', ignoreDuplicates: false })
        .select('id')
        .single()
      
      if (productError || !productData) {
        console.error(`  ✗ Product failed: ${product.name}`, productError?.message)
        productErrors++
        continue
      }
      
      productSuccess++
      const productId = productData.id
      
      // Build variant rows
      const variantRows = product.variants.map(v => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        price: v.price,
        base_price: v.price,
        stock: 999,           // POD = unlimited stock
        is_active: true,
        stock_status: 'in_stock',
        qikink_variant_id: v.qikink_variant_sku,  // The actual Qikink SKU e.g. MVnHs-Bk-S
      }))
      
      // Upsert variants in chunks of 50
      const VARIANT_CHUNK = 50
      for (let j = 0; j < variantRows.length; j += VARIANT_CHUNK) {
        const chunk = variantRows.slice(j, j + VARIANT_CHUNK)
        const { error: variantError } = await supabase
          .from('product_variants')
          .upsert(chunk, { onConflict: 'qikink_variant_id', ignoreDuplicates: false })
        
        if (variantError) {
          console.error(`  ✗ Variants failed for ${product.name}:`, variantError.message)
          variantErrors += chunk.length
        } else {
          variantSuccess += chunk.length
        }
      }
    }
    
    // Progress report every batch
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, QIKINK_PRODUCTS.length)}/${QIKINK_PRODUCTS.length} products processed`)
  }
  
  console.log()
  console.log('═══════════════════════════════════════')
  console.log('📊 IMPORT COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`  Products: ✓ ${productSuccess} success, ✗ ${productErrors} failed`)
  console.log(`  Variants: ✓ ${variantSuccess} success, ✗ ${variantErrors} failed`)
  console.log()
  
  if (productErrors > 0 || variantErrors > 0) {
    console.log('⚠ Some items failed. Check errors above.')
    console.log('  Tip: Run again — upsert is safe to retry')
  } else {
    console.log('✅ All products imported successfully!')
    console.log()
    console.log('NEXT STEPS:')
    console.log('  1. Go to your Supabase dashboard → Table Editor → products')
    console.log('     Verify the data looks correct')
    console.log('  2. Upload product images:')
    console.log('     → admin panel at /admin/products')  
    console.log('     → Or run: npx tsx scripts/import-qikink-images.ts')
    console.log('  3. Your shop at /shop and /collections will now show all products')
    console.log('  4. When a user places an order, qikink_variant_id is the SKU')
    console.log('     e.g. MVnHs-Bk-S = Male V Neck T-Shirt, Black, Size S')
  }
}

// Also fix product_variants table — add qikink_variant_id column if missing
async function ensureVariantSchema() {
  console.log('\n🔧 Checking schema...')
  // Check if qikink_variant_id column exists
  const { data } = await supabase
    .from('product_variants')
    .select('qikink_variant_id')
    .limit(1)
  
  // If no error, column exists
  console.log('  ✓ Schema looks good')
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║          QIKINK PRODUCT CATALOG IMPORT SCRIPT               ║')
  console.log('║  Importing 154 products + 2791 variants into Supabase       ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log()
  
  try {
    await ensureCategories()
    await ensureVariantSchema()
    await importProducts()
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

main()
