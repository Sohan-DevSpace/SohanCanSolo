import { NextResponse } from 'next/server'
import { uploadImageServer, validateImageFile, CloudinaryFolder } from '@/lib/cloudinary-upload'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') || 'products') as CloudinaryFolder
    const publicId = formData.get('publicId') as string | undefined

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Validate type and max size
    const validation = validateImageFile({ type: file.type, size: file.size })
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const uploaded = await uploadImageServer(fileBase64, folder, publicId)

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      public_id: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    })
  } catch (error: any) {
    console.error('Cloudinary Server Upload Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
