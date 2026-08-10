'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import {
  getCloudinaryUrl,
  getCloudinaryBlurUrl,
  CloudinaryImagePreset,
} from '@/lib/cloudinary-transform'

export interface CloudinaryImageProps extends Omit<ImageProps, 'src'> {
  src: string
  preset?: CloudinaryImagePreset
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video' | 'auto'
  className?: string
  alt: string
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  preset = 'original',
  aspectRatio = 'auto',
  className = '',
  alt,
  priority = false,
  fill = false,
  sizes,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Construct optimized Cloudinary URL
  const optimizedSrc = getCloudinaryUrl(src, preset)
  const blurUrl = getCloudinaryBlurUrl(src)

  const isCloudinary = src && src.includes('cloudinary.com')

  let aspectClass = ''
  switch (aspectRatio) {
    case 'square':
      aspectClass = 'aspect-square'
      break
    case 'portrait':
      aspectClass = 'aspect-[4/5]'
      break
    case 'landscape':
      aspectClass = 'aspect-[16/9]'
      break
    case 'video':
      aspectClass = 'aspect-video'
      break
    default:
      aspectClass = ''
  }

  if (hasError || !src) {
    return (
      <div
        className={`bg-stone-100 flex items-center justify-center text-stone-400 text-xs ${aspectClass} ${className}`}
      >
        <span>Image unavailable</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
      <Image
        src={optimizedSrc}
        alt={alt || 'Alpona luxury asset'}
        priority={priority}
        fill={fill}
        width={!fill ? width || 600 : undefined}
        height={!fill ? height || 750 : undefined}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        placeholder={isCloudinary ? 'blur' : undefined}
        blurDataURL={isCloudinary ? blurUrl : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-all duration-500 ease-out object-cover ${
          isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-102 blur-sm'
        }`}
        {...props}
      />
    </div>
  )
}
