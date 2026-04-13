'use client'

import { FeedbackButtons } from './FeedbackButtons'
import { formatDate } from '@/lib/utils'
import type { Caption } from '@/types'

interface Props {
  caption: Caption
  showFeedback?: boolean
}

export function CaptionCard({ caption, showFeedback = true }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 hover:shadow-sm transition-shadow">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium capitalize">
          {caption.language}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
          {caption.tone}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
          {caption.platform}
        </span>
        <span className="ml-auto text-gray-400">{formatDate(caption.createdAt)}</span>
      </div>

      {/* Caption text */}
      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
        {caption.finalText ?? caption.generatedText}
      </p>

      {/* Hashtags */}
      {caption.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {caption.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Topic */}
      <p className="text-xs text-gray-400">
        Topic: <span className="italic">{caption.topic}</span>
      </p>

      {/* Feedback */}
      {showFeedback && <FeedbackButtons caption={caption} />}
    </div>
  )
}
