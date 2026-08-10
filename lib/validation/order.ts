import { z } from 'zod'

export const razorpayCreateOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
})

export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  cartItems: z.array(z.any()).min(1, 'Cart is empty'),
  shippingAddress: z.record(z.string(), z.any()),
  userId: z.string().uuid(),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().default(0),
  giftWrap: z.boolean().optional().default(false),
  boxPacking: z.boolean().optional().default(false),
  rushOrder: z.boolean().optional().default(false),
  prepaidDiscount: z.number().optional().default(50),
  shippingCost: z.number().optional().default(0),
})

export const createCodOrderSchema = z.object({
  cartItems: z.array(z.any()).min(1, 'Cart is empty'),
  shippingAddress: z.record(z.string(), z.any()),
  userId: z.string().uuid(),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().default(0),
  giftWrap: z.boolean().optional().default(false),
  boxPacking: z.boolean().optional().default(false),
  rushOrder: z.boolean().optional().default(false),
  codFee: z.number().optional().default(50),
  shippingCost: z.number().optional().default(0),
})

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  emailOrPhone: z.string().min(1, 'Email or Phone is required'),
})

export const qikinkCreateOrderSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
})

export const qikinkWebhookSchema = z.object({
  qikink_order_id: z.string().optional(),
  client_order_id: z.string().optional(),
  status: z.string().optional(),
  tracking_code: z.string().optional(),
  courier_name: z.string().optional(),
  tracking_url: z.string().optional(),
}).passthrough()
