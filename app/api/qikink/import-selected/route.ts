import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const importQikinkProductsSchema = z.object({
  products: z.array(z.any()).min(1, 'No products provided for import.')
});

export const POST = createApiHandler({
  auth: 'admin',
  schema: importQikinkProductsSchema,
  handler: async ({ body }) => {
    try {
      const products = body.products || [];

      let successCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      // 3. Import logic (Upsert)
      for (const p of products) {
        try {
          // Find existing product by qikink_product_id or create new
          const { data: existingProduct } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('qikink_product_id', p.client_product_id) // using client_product_id as the unique anchor
            .maybeSingle();

          let productId = existingProduct?.id;

          if (!existingProduct) {
            // INSERT new product
            // Generating a slug from name
            const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
            
            const { data: newProduct, error: insertError } = await supabaseAdmin
              .from('products')
              .insert({
                name: p.product_name,
                slug,
                description: p.description || '',
                base_price: parseFloat(p.base_price) || 0,
                selling_price: (parseFloat(p.base_price) || 0) * 1.5, // default markup 50%
                qikink_product_id: p.client_product_id,
                is_active: true
              })
              .select('id')
              .single();

            if (insertError) throw insertError;
            productId = newProduct.id;
          } else {
            // UPDATE existing product (don't overwrite selling price or slug)
            const { error: updateError } = await supabaseAdmin
              .from('products')
              .update({
                name: p.product_name,
                description: p.description || '',
                base_price: parseFloat(p.base_price) || 0
              })
              .eq('id', productId);
              
            if (updateError) throw updateError;
          }

          // Import Variants if available
          if (p.variants && Array.isArray(p.variants)) {
            for (const v of p.variants) {
              // Manual check to avoid duplicates since no unique constraint might exist
              const { data: existingVariant } = await supabaseAdmin
                .from('product_variants')
                .select('id')
                .eq('product_id', productId)
                .eq('size', v.size)
                .eq('color', v.color)
                .maybeSingle();

              if (!existingVariant) {
                await supabaseAdmin
                  .from('product_variants')
                  .insert({
                    product_id: productId,
                    size: v.size,
                    color: v.color,
                    color_hex: v.color_hex || null,
                    stock: parseInt(v.stock_status) || 100,
                    qikink_variant_id: v.sku
                  });
              } else {
                await supabaseAdmin
                  .from('product_variants')
                  .update({
                    stock: parseInt(v.stock_status) || 100,
                    qikink_variant_id: v.sku
                  })
                  .eq('id', existingVariant.id);
              }
            }
          }
          
          successCount++;
        } catch (err: any) {
          console.error(`Failed to import product ${p.product_name}:`, err);
          failedCount++;
          errors.push({ product: p.product_name, error: err.message });
        }
      }

      return apiSuccess({ 
        imported: successCount, 
        failed: failedCount,
        errors 
      }, 200);

    } catch (error: any) {
      console.error('API Error importing Qikink products:', error);
      return apiError('INTERNAL_ERROR', error.message || 'Internal Server Error', 500);
    }
  }
});
