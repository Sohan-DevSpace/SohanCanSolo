export type CloudinaryImagePreset =
  | 'thumbnail'
  | 'product_card'
  | 'product_page'
  | 'hero_banner'
  | 'avatar'
  | 'original'

interface TransformOptions {
  width?: number
  height?: number
  quality?: string | number
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg'
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit'
  gravity?: 'auto' | 'face' | 'center'
}

const PRESETS: Record<CloudinaryImagePreset, TransformOptions> = {
  thumbnail: { width: 150, height: 150, crop: 'fill', gravity: 'auto' },
  product_card: { width: 600, height: 750, crop: 'fill', gravity: 'auto' },
  product_page: { width: 1000, height: 1250, crop: 'limit' },
  hero_banner: { width: 1920, height: 1080, crop: 'fill', gravity: 'center' },
  avatar: { width: 200, height: 200, crop: 'fill', gravity: 'face' },
  original: { format: 'auto', quality: 'auto' },
}

/**
 * Extracts public ID from full Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null
  try {
    const parts = url.split('/upload/')
    if (parts.length < 2 || !parts[1]) return null
    
    // Strip version prefix if present (v123456789/)
    let publicIdWithExt = parts[1].replace(/^v\d+\//, '')
    
    // Strip file extension
    const lastDotIndex = publicIdWithExt.lastIndexOf('.')
    if (lastDotIndex !== -1) {
      publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex)
    }
    return publicIdWithExt
  } catch (error) {
    console.error('Error parsing Cloudinary Public ID:', error)
    return null
  }
}

/**
 * Dynamically constructs optimized Cloudinary URL with f_auto, q_auto, dpr_auto
 */
export function getCloudinaryUrl(
  urlOrPublicId: string,
  preset: CloudinaryImagePreset = 'original',
  customTransformOptions?: TransformOptions
): string {
  if (!urlOrPublicId) return ''

  // Fallback for non-Cloudinary static URLs (e.g. Unsplash or local /images/)
  if (!urlOrPublicId.includes('cloudinary.com') && urlOrPublicId.startsWith('/')) {
    return urlOrPublicId
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'alpona'
  const publicId = getPublicIdFromUrl(urlOrPublicId) || urlOrPublicId

  const presetConfig = PRESETS[preset] || PRESETS.original
  const options = { ...presetConfig, ...customTransformOptions }

  const transformations: string[] = ['f_auto', 'q_auto', 'dpr_auto']

  if (options.crop) transformations.push(`c_${options.crop}`)
  if (options.gravity) transformations.push(`g_${options.gravity}`)
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)

  const transformString = transformations.join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`
}

/**
 * Generates low-quality blur-up placeholder URL for Next.js Image
 */
export function getCloudinaryBlurUrl(urlOrPublicId: string): string {
  return getCloudinaryUrl(urlOrPublicId, 'thumbnail', {
    width: 30,
    height: 30,
    quality: 20,
    crop: 'scale',
  })
}
