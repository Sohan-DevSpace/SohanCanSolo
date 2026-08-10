import { createApiHandler } from '@/lib/api/handler'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const POST = createApiHandler({
  auth: 'optional',
  handler: async ({ req, body }) => {
  try {
    const { prompt } = body as any
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // 1. GENERATE IMAGE (Mock or Real)
    // If you add an OPENAI_API_KEY to your .env, you can use the real DALL-E 3 API here.
    // For now, we simulate generation by picking a beautiful abstract image.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const aiMockups = [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop'
    ]
    const generatedImageUrl = (aiMockups[Math.floor(Math.random() * aiMockups.length)] || aiMockups[0]) as string

    // 2. Fetch the generated image
    const response = await fetch(generatedImageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // 3. Upload to Supabase Storage using Admin client to bypass RLS
    const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('designs')
      .upload(fileName, buffer, {
        contentType,
        upsert: false
      })

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('designs')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl
    const designSlug = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    // 4. Insert into designs table
    const { data: dbRecord, error: dbError } = await supabaseAdmin
      .from('designs')
      .insert({
        name: `AI Generation: ${prompt.slice(0, 30)}...`,
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
    console.error('AI Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'AI Generation failed' },
      { status: 500 }
    )
  }
  }
})

