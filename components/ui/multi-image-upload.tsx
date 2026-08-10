'use client'

import { useState } from 'react'
import { IconUpload, IconClose, IconExternalLink, IconLoader } from '@/components/shared/PremiumIcons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export function MultiImageUpload({ value, onChange }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'products')

      try {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Upload failed')
        }

        newUrls.push(data.url)
      } catch (error: any) {
        toast.error(`Failed to upload ${file?.name || 'file'}: ${error.message}`)
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
      toast.success('Images uploaded to Cloudinary successfully!')
    }
    setIsUploading(false)
    e.target.value = '' // Reset input
  }

  const handleAddLink = () => {
    if (!linkInput.trim()) return
    onChange([...value, linkInput.trim()])
    setLinkInput('')
  }

  const removeImage = (idxToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== idxToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"
          >
            {isUploading ? (
              <IconLoader size={16} className="mr-2 animate-spin" />
            ) : (
              <IconUpload size={16} className="mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Paste image URL..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="bg-[#09090b] border-white/[0.06] text-white text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddLink()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLink}
            className="border-zinc-700 text-zinc-300 px-3"
          >
            <IconExternalLink size={16} />
          </Button>
        </div>
      </div>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.1] bg-black/50 group"
            >
              <img
                src={url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                >
                  <IconClose size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
