'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Loader2, X } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

interface Props {
  url?: string
  onUpload: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ url, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<ApiResponse<{ url: string }>>('/api/upload/image', form)
      onUpload(data.data.url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  if (url) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <img src={url} alt="Post image" className="w-full max-h-56 object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 w-full justify-center px-4 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        {uploading ? 'Uploading…' : 'Add photo'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
