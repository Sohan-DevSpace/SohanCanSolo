'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string, trackingUrl?: string) {
  const supabase = await createClient()

  const updateData: any = { status: newStatus }
  if (trackingUrl !== undefined) {
    updateData.tracking_url = trackingUrl
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  return { success: true }
}

export async function syncOrderToQikink(orderId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/qikink/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Failed to sync with Qikink')
    }

    revalidatePath('/admin/orders')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error syncing to Qikink:', error)
    return { success: false, error: error.message }
  }
}

export async function updateQikinkOrderDetails(orderId: string, qikinkOrderId: string, trackingNumber?: string, courierName?: string) {
  const supabase = await createClient()

  const updateData: any = {}
  if (qikinkOrderId) updateData.qikink_order_id = qikinkOrderId
  if (trackingNumber) updateData.tracking_number = trackingNumber
  if (courierName) updateData.courier_name = courierName

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating Qikink order details:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  return { success: true }
}
