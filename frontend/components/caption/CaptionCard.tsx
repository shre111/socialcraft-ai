'use client'

import { useState } from 'react'
import { Linkedin, Loader2, CheckCircle2, CalendarClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FeedbackButtons } from './FeedbackButtons'
import { formatDate } from '@/lib/utils'
import { useLinkedInStatus, useLinkedInPublish } from '@/hooks/useLinkedIn'
import type { Caption } from '@/types'

interface Props {
  caption: Caption
  showFeedback?: boolean
}

export function CaptionCard({ caption, showFeedback = true }: Props) {
  const router = useRouter()
  const { data: linkedInStatus } = useLinkedInStatus()
  const publish = useLinkedInPublish()
  const [published, setPublished] = useState(false)

  const fullText =
    (caption.finalText ?? caption.generatedText) +
    (caption.hashtags.length > 0
      ? '\n\n' + caption.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : '')

  const handlePublish = async () => {
    await publish.mutateAsync({ captionId: caption.id, text: fullText })
    setPublished(true)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 hover:shadow-sm transition-shadow">
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

      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
        {caption.finalText ?? caption.generatedText}
      </p>

      {caption.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {caption.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Topic: <span className="italic">{caption.topic}</span>
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showFeedback && <FeedbackButtons caption={caption} />}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => router.push('/dashboard/scheduler')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <CalendarClock className="h-3 w-3" />
            Schedule
          </button>

        {linkedInStatus?.connected && (
          published ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Posted to LinkedIn
            </div>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publish.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors disabled:opacity-50"
            >
              {publish.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Linkedin className="h-3 w-3" />
              )}
              Post to LinkedIn
            </button>
          )
        )}
        </div>
      </div>
    </div>
  )
}
