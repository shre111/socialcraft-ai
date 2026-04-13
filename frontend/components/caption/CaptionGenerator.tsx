'use client'

import { useState } from 'react'
import { Loader2, Sparkles, AlertCircle, Brain } from 'lucide-react'
import { useGenerateCaptions } from '@/hooks/useCaption'
import { useCaptionStore } from '@/store/captionStore'
import { LanguageSelector } from './LanguageSelector'
import { ToneSelector } from '@/components/shared/ToneSelector'
import { PlatformSelector } from '@/components/shared/PlatformSelector'
import { CaptionCard } from './CaptionCard'

export function CaptionGenerator() {
  const {
    topic, setTopic,
    language, setLanguage,
    tone, setTone,
    platform, setPlatform,
    captions, personalizationUsed, confidenceScore,
  } = useCaptionStore()

  const generate = useGenerateCaptions()
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      setValidationError('Please enter a topic.')
      return
    }
    setValidationError('')
    generate.mutate({ topic: topic.trim(), language, tone, platform, count: 3 })
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6"
      >
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What&apos;s your post about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="e.g. Launching my new fitness app that tracks calories using AI..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-gray-400"
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
              <Loader2 className="h-5 w-5 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Generate Captions
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {generate.isError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {generate.error?.message ?? 'Failed to generate captions. Please try again.'}
        </div>
      )}

      {/* Personalization badge */}
      {personalizationUsed && captions.length > 0 && (
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl px-4 py-3 text-sm">
          <Brain className="h-4 w-4 flex-shrink-0" />
          Personalized to your style — confidence {Math.round(confidenceScore * 100)}%
        </div>
      )}

      {/* Results */}
      {captions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">
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
