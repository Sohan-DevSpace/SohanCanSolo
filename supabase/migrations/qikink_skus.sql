-- ALpona: Qikink Production SKUs Mapper
-- Use this script to easily map your Supabase products/variants to real Qikink SKUs.
-- This ensures the Qikink API accepts the order payload during checkout.

-- Instructions:
-- Replace 'your_qikink_sku_here' with the actual SKU from your Qikink catalog.
-- E.g. 'TSHIRT-BLK-L' or 'HOODIE-WHT-M'

-- 1. Example mapping for an entire product (if variants share the same base SKU or Qikink handles variations dynamically via payload)
-- UPDATE public.products
-- SET qikink_product_id = 'YOUR_QIKINK_PRODUCT_SKU'
-- WHERE slug = 'classic-tshirt';

-- 2. Example mapping for specific product variants (Recommended for strict inventory sync)
-- UPDATE public.product_variants
-- SET qikink_variant_id = 'TSHIRT-BLK-M'
-- WHERE id = 'uuid-of-the-variant';

-- Quick fix to bypass SKU validation errors for testing real API sync (DANGEROUS IN PRODUCTION IF FAKE SKUS FAIL AT QIKINK):
-- If Qikink rejects fake SKUs, DO NOT RUN THIS. Only run this if Qikink test mode accepts any string.
/*
UPDATE public.product_variants
SET qikink_variant_id = 'TEST-SKU-' || size || '-' || color
WHERE qikink_variant_id IS NULL;
*/
