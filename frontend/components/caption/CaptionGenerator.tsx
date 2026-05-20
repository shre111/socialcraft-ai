'use client'

import { useRef, useState } from 'react'
import { Loader2, Sparkles, AlertCircle, Brain, ImagePlus, X } from 'lucide-react'
import { useGenerateCaptions } from '@/hooks/useCaption'
import { useCaptionStore } from '@/store/captionStore'
import { LanguageSelector } from './LanguageSelector'
import { ToneSelector } from '@/components/shared/ToneSelector'
import { PlatformSelector } from '@/components/shared/PlatformSelector'
import { CaptionCard } from './CaptionCard'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB — Claude's limit

export function CaptionGenerator() {
  const {
    topic, setTopic,
    imageBase64, imageMediaType, setImage, clearImage,
    language, setLanguage,
    tone, setTone,
    platform, setPlatform,
    captions, personalizationUsed, confidenceScore,
  } = useCaptionStore()

  const generate = useGenerateCaptions()
  const [validationError, setValidationError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_BYTES) {
      setValidationError('Image must be under 4 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result is "data:image/jpeg;base64,XXXXX"
      const [prefix, data] = result.split(',')
      const mediaType = prefix.replace('data:', '').replace(';base64', '')
      setImage(data, mediaType)
      setImagePreview(result)
      setValidationError('')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    clearImage()
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() && !imageBase64) {
      setValidationError('Enter a topic or upload an image.')
      return
    }
    setValidationError('')
    generate.mutate({
      topic: topic.trim() || undefined,
      imageBase64: imageBase64 || undefined,
      imageMediaType: imageMediaType || undefined,
      language,
      tone,
      platform,
      count: 3,
    })
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6"
      >
        {/* Image upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload image <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Choose photo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-violet-300 dark:hover:border-violet-600 transition-colors group"
            >
              <ImagePlus className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 group-hover:text-violet-400 transition-colors mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Drop a photo here or <span className="text-violet-600 dark:text-violet-400">browse</span>
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">JPEG, PNG, WebP · max 4 MB</p>
            </button>
          )}
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {imagePreview ? 'Add context' : "What's your post about?"}
            {imagePreview && <span className="text-gray-400 dark:text-gray-500 font-normal"> (optional)</span>}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={imagePreview ? 2 : 3}
            placeholder={
              imagePreview
                ? 'e.g. My trip to Goa, summer vibes…'
                : 'e.g. Launching my new fitness app that tracks calories using AI…'
            }
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          {validationError && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {validationError}
            </p>
          )}
        </div>

        <LanguageSelector value={language} onChange={setLanguage} />
        <ToneSelector value={tone} onChange={setTone} />
        <PlatformSelector value={platform} onChange={setPlatform} />

        <button
          type="submit"
          disabled={generate.isPending}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generate.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {imageBase64 ? 'Analysing image…' : 'Generating…'}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Generate Captions
            </>
          )}
        </button>
      </form>

      {generate.isError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {generate.error?.message ?? 'Failed to generate captions. Please try again.'}
        </div>
      )}

      {personalizationUsed && captions.length > 0 && (
        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 rounded-xl px-4 py-3 text-sm">
          <Brain className="h-4 w-4 flex-shrink-0" />
          Personalized to your style — confidence {Math.round(confidenceScore * 100)}%
        </div>
      )}

      {captions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {captions.length} caption{captions.length > 1 ? 's' : ''} generated
          </h2>
          {captions.map((caption) => (
            <CaptionCard key={caption.id} caption={caption} showFeedback />
          ))}
        </div>
      )}
    </div>
  )
}
