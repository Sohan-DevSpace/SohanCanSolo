import { cloudinary } from './cloudinary'
import { getPublicIdFromUrl } from './cloudinary-transform'

/**
 * Deletes an asset from Cloudinary using its Public ID or full URL
 */
export async function deleteCloudinaryImage(urlOrPublicId: string): Promise<{ success: boolean; result?: string; error?: string }> {
  if (!urlOrPublicId) {
    return { success: false, error: 'No image URL or Public ID provided' }
  }

  // If it's not a Cloudinary image URL, skip Cloudinary deletion
  if (urlOrPublicId.includes('/') && !urlOrPublicId.includes('cloudinary.com')) {
    return { success: true, result: 'Skipped non-Cloudinary asset' }
  }

  const publicId = getPublicIdFromUrl(urlOrPublicId) || urlOrPublicId

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    })

    if (res.result === 'ok' || res.result === 'not_found') {
      return { success: true, result: res.result }
    }

    return { success: false, error: `Cloudinary destroy result: ${res.result}` }
  } catch (error: any) {
    console.error(`Failed to delete Cloudinary asset (${publicId}):`, error)
    return { success: false, error: error.message || 'Deletion failed' }
  }
}

/**
 * Deletes multiple assets from Cloudinary in batch
 */
export async function deleteCloudinaryImagesBatch(urlsOrPublicIds: string[]) {
  if (!urlsOrPublicIds || urlsOrPublicIds.length === 0) return { success: true, count: 0 }

  const results = await Promise.all(
    urlsOrPublicIds.map(url => deleteCloudinaryImage(url))
  )

  const successfulDeletes = results.filter(r => r.success).length

  return {
    success: successfulDeletes === urlsOrPublicIds.length,
    count: successfulDeletes,
    total: urlsOrPublicIds.length,
  }
}
