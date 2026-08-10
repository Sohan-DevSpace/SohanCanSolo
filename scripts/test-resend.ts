import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { sendOrderConfirmationEmail } from '../lib/email'

async function runTest() {
  console.log('Testing Resend email configuration...')
  console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)

  try {
    const response = await sendOrderConfirmationEmail({
      to: 'delivered@resend.dev', // Safe Resend test recipient
      customerName: 'Test Customer',
      orderNumber: 'ORD-TEST-1001',
      items: [
        {
          name: 'Heavyweight Oversized Tee',
          size: 'L',
          color: 'Black',
          quantity: 1,
          price: 799,
        },
      ],
      shippingAddress: {
        name: 'Test Customer',
        address: '123 Test Street',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700001',
      },
      total: 799,
    })

    console.log('Resend Test Email Success Result:', response)
  } catch (err: any) {
    console.error('Resend Test Email Failed:', err)
  }
}

runTest()
