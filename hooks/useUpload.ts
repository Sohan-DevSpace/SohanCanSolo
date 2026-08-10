import { useState, useCallback } from 'react'
import axios from 'axios'
import { validateImageFile, CloudinaryFolder } from '@/lib/cloudinary-upload'

export interface UploadedFileItem {
  id: string
  url: string
  public_id: string
  previewUrl: string
  name: string
  size: number
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  originalSize?: number
  compressedSize?: number
}

export function useUpload(defaultFolder: CloudinaryFolder = 'products') {
  const [folder, setFolder] = useState<CloudinaryFolder>(defaultFolder)
  const [items, setItems] = useState<UploadedFileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFileItem = async (fileItem: UploadedFileItem, file: File) => {
    setItems(prev =>
      prev.map(i => (i.id === fileItem.id ? { ...i, status: 'uploading', progress: 10, error: undefined } : i))
    )

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await axios.post('/api/cloudinary/upload', formData, {
        onUploadProgress: progressEvent => {
          const total = progressEvent.total || file.size
          const currentProgress = Math.round((progressEvent.loaded * 90) / total)
          setItems(prev =>
            prev.map(i => (i.id === fileItem.id ? { ...i, progress: Math.min(90, currentProgress) } : i))
          )
        },
      })

      if (response.data.success) {
        setItems(prev =>
          prev.map(i =>
            i.id === fileItem.id
              ? {
                  ...i,
                  status: 'success',
                  progress: 100,
                  url: response.data.url,
                  public_id: response.data.public_id,
                  compressedSize: response.data.bytes,
                }
              : i
          )
        )
      } else {
        throw new Error(response.data.error || 'Upload failed')
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Upload failed'
      setItems(prev =>
        prev.map(i => (i.id === fileItem.id ? { ...i, status: 'error', error: errorMsg, progress: 0 } : i))
      )
    }
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFileArray = Array.from(files)
    const newItems: { item: UploadedFileItem; file: File }[] = []

    newFileArray.forEach(file => {
      const validation = validateImageFile({ type: file.type, size: file.size })
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      const previewUrl = URL.createObjectURL(file)

      const fileItem: UploadedFileItem = {
        id,
        name: file.name,
        size: file.size,
        originalSize: file.size,
        previewUrl,
        url: '',
        public_id: '',
        progress: validation.valid ? 0 : 0,
        status: validation.valid ? 'idle' : 'error',
        error: validation.error,
      }

      setItems(prev => [...prev, fileItem])
      if (validation.valid) {
        newItems.push({ item: fileItem, file })
      }
    })

    if (newItems.length > 0) {
      setIsUploading(true)
      Promise.all(newItems.map(({ item, file }) => uploadFileItem(item, file))).finally(() => {
        setIsUploading(false)
      })
    }
  }, [folder])

  const retryUpload = useCallback((id: string, file: File) => {
    const targetItem = items.find(i => i.id === id)
    if (targetItem) {
      uploadFileItem(targetItem, file)
    }
  }, [items, folder])

  const removeItem = useCallback(async (id: string) => {
    const target = items.find(i => i.id === id)
    if (target && target.url) {
      try {
        await axios.post('/api/cloudinary/delete', { url: target.url })
      } catch (e) {
        console.warn('Failed background asset deletion:', e)
      }
    }
    setItems(prev => prev.filter(i => i.id !== id))
  }, [items])

  const reorderItems = useCallback((startIndex: number, endIndex: number) => {
    setItems(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      if (removed) {
        result.splice(endIndex, 0, removed)
      }
      return result
    })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
  }, [])

  return {
    folder,
    setFolder,
    items,
    setItems,
    isUploading,
    addFiles,
    retryUpload,
    removeItem,
    reorderItems,
    clearAll,
    successfulUrls: items.filter(i => i.status === 'success' && i.url).map(i => i.url),
  }
}
