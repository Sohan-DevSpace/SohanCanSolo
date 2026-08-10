import Razorpay from 'razorpay'
import { createApiHandler, apiSuccess, apiError } from '@/lib/api/handler'
import { razorpayCreateOrderSchema } from '@/lib/validation/order'

// Initialize razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const POST = createApiHandler({
  schema: razorpayCreateOrderSchema,
  auth: 'required',
  handler: async ({ body }) => {
    const { amount, currency } = body

    // Create an order
    const options = {
      amount: Math.round(amount), // amount in the smallest currency unit (paisa for INR)
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    }

    try {
      const order = await razorpay.orders.create(options)
      return apiSuccess({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      })
    } catch (error: any) {
      console.error('Razorpay Order Creation Error:', error)
      return apiError('RAZORPAY_ERROR', error.message || 'Something went wrong', 500)
    }
  }
})
