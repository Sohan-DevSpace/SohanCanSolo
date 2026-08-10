import { NextResponse } from 'next/server'
import { deleteCloudinaryImage, deleteCloudinaryImagesBatch } from '@/lib/cloudinary-delete'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url, urls, publicId } = body

    if (urls && Array.isArray(urls)) {
      const batchRes = await deleteCloudinaryImagesBatch(urls)
      return NextResponse.json({ success: true, result: batchRes })
    }

    const target = url || publicId
    if (!target) {
      return NextResponse.json({ success: false, error: 'No URL or Public ID provided' }, { status: 400 })
    }

    const delRes = await deleteCloudinaryImage(target)
    return NextResponse.json(delRes)
  } catch (error: any) {
    console.error('Cloudinary Asset Delete API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Deletion failed' },
      { status: 500 }
    )
  }
}
