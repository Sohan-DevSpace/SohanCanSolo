import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if Service Role Key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in your .env file. Please copy your service role key from your Supabase Dashboard (Settings -> API) to your local .env file.' 
      }, { status: 500 })
    }

    // 1. Upload to Supabase Storage using Admin client to bypass RLS
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    
    // We need to convert File to ArrayBuffer for the supabase-js upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('designs')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: false
      })

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('designs')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl
    const designSlug = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    // 2. Insert into designs table
    const { data: dbRecord, error: dbError } = await supabaseAdmin
      .from('designs')
      .insert({
        name: `Design Studio Upload`,
        slug: designSlug,
        image_url: publicUrl,
        thumbnail_url: publicUrl,
        is_active: true,
      } as any)
      .select('id')
      .single()

    if (dbError) throw new Error(`Database insertion failed: ${dbError.message}`)

    return NextResponse.json({
      success: true,
      id: dbRecord.id,
      url: publicUrl
    })
  } catch (error: any) {
    console.error('Design Upload Error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
