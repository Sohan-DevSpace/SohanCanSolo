'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { IconUpload, IconClose, IconExternalLink, IconLoader } from '@/components/shared/PremiumIcons'
import { Clipboard, Image as ImageIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export function MultiImageUpload({ value, onChange }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Upload an array of File objects to Cloudinary
  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    const toastId = toast.loading(`Uploading ${files.length} image${files.length > 1 ? 's' : ''} to Cloudinary...`)
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
        toast.error(`Failed to upload ${file?.name || 'image'}: ${error.message}`, { id: toastId })
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
      toast.success(`Successfully uploaded ${newUrls.length} image${newUrls.length > 1 ? 's' : ''}!`, { id: toastId })
    } else {
      toast.dismiss(toastId)
    }

    setIsUploading(false)
  }, [value, onChange])

  // Handle standard File Input selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const fileList = Array.from(files)
    await uploadFiles(fileList)
    e.target.value = '' // Reset input
  }

  // Handle Clipboard Paste Event (Ctrl + V / Cmd + V)
  const handlePasteEvent = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items || items.length === 0) return

    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        if (blob) {
          const extension = item.type.split('/')[1] || 'png'
          const file = new File([blob], `pasted-image-${Date.now()}-${i}.${extension}`, { type: item.type })
          imageFiles.push(file)
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      toast('Pasted image detected from clipboard!', { icon: '📋' })
      uploadFiles(imageFiles)
    }
  }, [uploadFiles])

  // Attach global paste listener when component is active
  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent)
    return () => {
      window.removeEventListener('paste', handlePasteEvent)
    }
  }, [handlePasteEvent])

  // Manual "Paste from Clipboard" button click handler
  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read()
        const imageFiles: File[] = []

        for (const item of clipboardItems) {
          const imageType = item.types.find(t => t.startsWith('image/'))
          if (imageType) {
            const blob = await item.getType(imageType)
            const extension = imageType.split('/')[1] || 'png'
            const file = new File([blob], `clipboard-image-${Date.now()}.${extension}`, { type: imageType })
            imageFiles.push(file)
          }
        }

        if (imageFiles.length > 0) {
          await uploadFiles(imageFiles)
          return
        }
      }

      // Fallback: Read text if a URL is copied
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          onChange([...value, text.trim()])
          toast.success('Pasted image URL from clipboard!')
          return
        }
      }

      toast('Press Ctrl + V to paste any image from your clipboard!', { icon: '📋' })
    } catch (err) {
      toast('Press Ctrl + V to paste any copied image directly!', { icon: '📋' })
    }
  }

  const handleAddLink = () => {
    if (!linkInput.trim()) return
    onChange([...value, linkInput.trim()])
    setLinkInput('')
    toast.success('Image link added!')
  }

  const removeImage = (idxToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== idxToRemove))
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Visual Dropzone & Controls */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${
          isHoveringDropzone 
            ? 'border-[#B8763C] bg-[#B8763C]/10' 
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsHoveringDropzone(true) }}
        onDragLeave={() => setIsHoveringDropzone(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsHoveringDropzone(false)
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFiles(Array.from(e.dataTransfer.files))
          }
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#B8763C]/15 border border-[#B8763C]/30 flex items-center justify-center text-[#B8763C]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Product Gallery Images</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Upload files, paste directly using <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-amber-400 font-mono">Ctrl + V</kbd>, or add an image URL
            </p>
          </div>
        </div>

        {/* Action Options Row: Upload, Paste, Link */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
          {/* Option 1: Upload File */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <IconLoader size={14} className="animate-spin text-[#B8763C]" />
              ) : (
                <IconUpload size={14} className="text-[#B8763C]" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
            </Button>
          </div>

          {/* Option 2: Paste from Clipboard */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePasteButtonClick}
            disabled={isUploading}
            className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
          >
            <Clipboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Paste (Ctrl+V)</span>
          </Button>

          {/* Option 3: Add Link / URL */}
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
      </div>

      {/* Image Grid Gallery */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.1] bg-black/50 group shadow-sm hover:border-[#B8763C]/50 transition-colors"
            >
              <img
                src={url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                #{idx + 1}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  aria-label="Remove image"
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
