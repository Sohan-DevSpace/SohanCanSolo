import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, orderNum, topic, priority, message, fileUrl } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, Email, and Message are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          order_number: orderNum ? orderNum.trim() : null,
          topic: topic || 'Order & Tracking',
          priority: priority || 'Standard',
          message: message.trim(),
          file_url: fileUrl || null,
          status: 'Pending'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error inserting contact_message:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Support message logged successfully.',
      ticket: data
    })
  } catch (err: any) {
    console.error('Contact API handler error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
