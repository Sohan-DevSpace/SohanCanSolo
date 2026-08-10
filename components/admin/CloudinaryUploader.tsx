'use client'

import React, { useRef, useState } from 'react'
import {
  Upload,
  X,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Folder,
  ArrowUpRight,
  ArrowRight,
  GripVertical,
} from 'lucide-react'
import { useUpload } from '@/hooks/useUpload'
import { CloudinaryFolder } from '@/lib/cloudinary-upload'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'

interface CloudinaryUploaderProps {
  onImagesChange?: (urls: string[]) => void
  initialFolder?: CloudinaryFolder
  multiple?: boolean
  maxFiles?: number
  className?: string
}

const FOLDER_OPTIONS: { value: CloudinaryFolder; label: string }[] = [
  { value: 'products', label: 'alpona/products' },
  { value: 'categories', label: 'alpona/categories' },
  { value: 'banners', label: 'alpona/banners' },
  { value: 'avatars', label: 'alpona/avatars' },
  { value: 'reviews', label: 'alpona/reviews' },
  { value: 'designs', label: 'alpona/designs' },
  { value: 'ai', label: 'alpona/ai' },
  { value: 'blog', label: 'alpona/blog' },
]

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onImagesChange,
  initialFolder = 'products',
  multiple = true,
  maxFiles = 10,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const {
    folder,
    setFolder,
    items,
    isUploading,
    addFiles,
    retryUpload,
    removeItem,
    clearAll,
  } = useUpload(initialFolder)

  // Notify parent on image changes
  React.useEffect(() => {
    if (onImagesChange) {
      const urls = items.filter(i => i.status === 'success' && i.url).map(i => i.url)
      onImagesChange(urls)
    }
  }, [items, onImagesChange])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Bar: Folder Selector & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2 text-stone-600 font-medium">
          <Folder className="w-4 h-4 text-[#B8763C]" />
          <span>Destination Folder:</span>
          <select
            value={folder}
            onChange={e => setFolder(e.target.value as CloudinaryFolder)}
            className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#B8763C]"
          >
            {FOLDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-stone-500 hover:text-red-600 transition-colors font-medium text-xs flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear All ({items.length})
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-[#B8763C] bg-[#B8763C]/5 scale-[0.99]'
            : 'border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#B8763C]/10 flex items-center justify-center text-[#B8763C]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">
              Drag & Drop images here or <span className="text-[#B8763C] underline">browse files</span>
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Supports JPG, PNG, WebP, AVIF, GIF, SVG (Max 10MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Items Grid & Progress */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {items.map(item => (
            <div
              key={item.id}
              className="relative group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col"
            >
              {/* Preview Box */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                {item.url ? (
                  <CloudinaryImage
                    src={item.url}
                    alt={item.name}
                    preset="thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                )}

                {/* Status Overlay */}
                {item.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-white mb-2" />
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#B8763C] h-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono mt-1.5">{item.progress}%</span>
                  </div>
                )}

                {item.status === 'success' && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                {item.status === 'error' && (
                  <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-white text-center">
                    <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-[11px] text-red-200 line-clamp-2">{item.error}</span>
                  </div>
                )}

                {/* Delete / Remove Action */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 left-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details & Info */}
              <div className="p-2.5 text-xs space-y-1 bg-white">
                <p className="font-medium text-stone-800 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {item.compressedSize && (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3" /> {(item.compressedSize / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
