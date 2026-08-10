import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler';
import { z } from 'zod';

const fetchQikinkProductsSchema = z.object({
  cookie: z.string().min(1, 'Qikink session cookie is required.')
});

export const POST = createApiHandler({
  auth: 'admin',
  schema: fetchQikinkProductsSchema,
  handler: async ({ body }) => {
    try {
      const cookie = body.cookie;

      // 3. Fetch products from Qikink
      const response = await fetch('https://dashboard.qikink.com/products/fetch_my_products', {
        method: 'POST',
        headers: {
          'Cookie': cookie,
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        },
        // Depending on Qikink API, we might need a payload like limit, offset, etc.
        // Usually passing nothing returns the first page or everything
        body: JSON.stringify({ page: 1, limit: 500 }) 
      });

      if (!response.ok) {
        return apiError('QIKINK_API_ERROR', `Qikink API responded with status ${response.status}`, 502);
      }

      const data = await response.json();
      
      // Some endpoints wrap the products in an array, some in a "products" property
      const products = data.products || data || [];

      return apiSuccess({ products }, 200);

    } catch (error: any) {
      console.error('API Error fetching Qikink products:', error);
      return apiError('INTERNAL_ERROR', error.message || 'Internal Server Error', 500);
    }
  }
});
