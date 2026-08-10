import { useState } from 'react'
import axios from 'axios'

export function useDeleteImage() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteImage = async (urlOrPublicId: string) => {
    setIsDeleting(true)
    setError(null)
    try {
      const response = await axios.post('/api/cloudinary/delete', { url: urlOrPublicId })
      if (response.data.success) {
        setIsDeleting(false)
        return true
      } else {
        throw new Error(response.data.error || 'Failed to delete asset')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Deletion error'
      setError(msg)
      setIsDeleting(false)
      return false
    }
  }

  const deleteBatch = async (urls: string[]) => {
    setIsDeleting(true)
    setError(null)
    try {
      const response = await axios.post('/api/cloudinary/delete', { urls })
      if (response.data.success) {
        setIsDeleting(false)
        return true
      } else {
        throw new Error(response.data.error || 'Failed to delete batch')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Batch deletion error'
      setError(msg)
      setIsDeleting(false)
      return false
    }
  }

  return {
    deleteImage,
    deleteBatch,
    isDeleting,
    error,
  }
}
