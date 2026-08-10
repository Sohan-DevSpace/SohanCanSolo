import { NextResponse } from 'next/server'
import { generateUploadSignature, CloudinaryFolder } from '@/lib/cloudinary-upload'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const folder = (body.folder || 'products') as CloudinaryFolder

    const signatureData = generateUploadSignature(folder)

    return NextResponse.json({
      success: true,
      ...signatureData,
    })
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Signature generation failed' },
      { status: 500 }
    )
  }
}
