import { cloudinary } from './cloudinary'

export type CloudinaryFolder =
  | 'products'
  | 'categories'
  | 'avatars'
  | 'reviews'
  | 'banners'
  | 'designs'
  | 'ai'
  | 'blog'

const FOLDER_MAPPINGS: Record<CloudinaryFolder, string> = {
  products: 'alpona/products',
  categories: 'alpona/categories',
  avatars: 'alpona/avatars',
  reviews: 'alpona/reviews',
  banners: 'alpona/banners',
  designs: 'alpona/designs',
  ai: 'alpona/ai',
  blog: 'alpona/blog',
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export interface UploadValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: { type: string; size: number }): UploadValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type (${file.type}). Allowed types: JPG, PNG, WebP, AVIF, GIF, SVG.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    }
  }

  return { valid: true }
}

/**
 * Generates signed parameters for secure client-side direct upload
 */
export function generateUploadSignature(folder: CloudinaryFolder = 'products') {
  const targetFolder = FOLDER_MAPPINGS[folder] || FOLDER_MAPPINGS.products
  const timestamp = Math.round(new Date().getTime() / 1000)
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is missing in environment variables')
  }

  const paramsToSign = {
    timestamp,
    folder: targetFolder,
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME

  return {
    signature,
    timestamp,
    folder: targetFolder,
    apiKey,
    cloudName,
  }
}

/**
 * Server-side upload handler (Base64 string or Buffer)
 */
export async function uploadImageServer(
  fileBase64OrUrl: string,
  folder: CloudinaryFolder = 'products',
  publicId?: string
) {
  const targetFolder = FOLDER_MAPPINGS[folder] || FOLDER_MAPPINGS.products

  const uploadOptions: any = {
    folder: targetFolder,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  }

  if (publicId) {
    uploadOptions.public_id = publicId
  }

  const result = await cloudinary.uploader.upload(fileBase64OrUrl, uploadOptions)

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}
