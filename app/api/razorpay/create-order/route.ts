import Razorpay from 'razorpay'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { razorpayCreateOrderSchema } from '@/lib/validation/order'

export const POST = createApiHandler({
  schema: razorpayCreateOrderSchema,
  auth: 'optional',
  handler: async ({ body }) => {
    const { amount, currency } = body

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing from environment variables')
      return apiError(
        'RAZORPAY_CONFIG_ERROR',
        'Razorpay keyId or keySecret environment variables are not configured.',
        500
      )
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })

      // Create an order
      const options = {
        amount: Math.round(amount), // amount in paisa (smallest unit for INR)
        currency,
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      }

      const order = await razorpay.orders.create(options)
      return apiSuccess({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
      })
    } catch (error: any) {
      console.error('Razorpay Order Creation Error:', error)
      return apiError('RAZORPAY_ERROR', error.message || 'Failed to create Razorpay order', 500)
    }
  }
})
