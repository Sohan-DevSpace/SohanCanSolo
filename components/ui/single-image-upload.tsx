'use client'

import { useState, useEffect, useCallback } from 'react'
import { IconUpload, IconClose, IconExternalLink, IconLoader } from '@/components/shared/PremiumIcons'
import { Clipboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface SingleImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function SingleImageUpload({ value, onChange }: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')

  const uploadSingleFile = useCallback(async (file: File) => {
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading('Uploading image to Cloudinary...')
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

      onChange(data.url)
      toast.success('Image uploaded successfully!', { id: toastId })
    } catch (error: any) {
      toast.error(`Failed to upload: ${error.message}`, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadSingleFile(file)
    e.target.value = ''
  }

  // Handle Clipboard Paste Event (Ctrl + V)
  const handlePasteEvent = useCallback((e: ClipboardEvent) => {
    if (value) return // Already has image
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        if (blob) {
          e.preventDefault()
          const extension = item.type.split('/')[1] || 'png'
          const file = new File([blob], `pasted-image-${Date.now()}.${extension}`, { type: item.type })
          toast('Pasted image detected from clipboard!', { icon: '📋' })
          uploadSingleFile(file)
          break
        }
      }
    }
  }, [value, uploadSingleFile])

  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent)
    return () => {
      window.removeEventListener('paste', handlePasteEvent)
    }
  }, [handlePasteEvent])

  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
          const imageType = item.types.find(t => t.startsWith('image/'))
          if (imageType) {
            const blob = await item.getType(imageType)
            const extension = imageType.split('/')[1] || 'png'
            const file = new File([blob], `clipboard-image-${Date.now()}.${extension}`, { type: imageType })
            await uploadSingleFile(file)
            return
          }
        }
      }

      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          onChange(text.trim())
          toast.success('Pasted image URL from clipboard!')
          return
        }
      }

      toast('Press Ctrl + V to paste an image from your clipboard!', { icon: '📋' })
    } catch {
      toast('Press Ctrl + V to paste an image from your clipboard!', { icon: '📋' })
    }
  }

  const handleAddLink = () => {
    if (!linkInput.trim()) return
    onChange(linkInput.trim())
    setLinkInput('')
    toast.success('Image link added!')
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-square w-32 rounded-lg overflow-hidden border border-white/[0.1] bg-black/50 group">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors"
            >
              <IconClose size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
          {/* Upload File */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <IconLoader size={14} className="animate-spin text-[#B8763C]" />
              ) : (
                <IconUpload size={14} className="text-[#B8763C]" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
            </Button>
          </div>

          {/* Paste Clipboard */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePasteButtonClick}
            disabled={isUploading}
            className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 flex items-center justify-center gap-2"
          >
            <Clipboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Paste (Ctrl+V)</span>
          </Button>

          {/* URL Input */}
          <div className="flex gap-1.5">
            <Input
              placeholder="Image URL..."
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              className="bg-[#09090b] border-zinc-700 text-white text-xs h-9"
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
              className="border-zinc-700 text-zinc-300 px-2.5 h-9 shrink-0"
            >
              <IconExternalLink size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
