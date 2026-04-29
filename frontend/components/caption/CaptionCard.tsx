'use client'

import { useState } from 'react'
import { Linkedin, Loader2, CheckCircle2, CalendarClock, Facebook, Instagram } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FeedbackButtons } from './FeedbackButtons'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { formatDate } from '@/lib/utils'
import { useLinkedInStatus, useLinkedInPublish } from '@/hooks/useLinkedIn'
import { useMetaStatus, usePublishFacebook, usePublishInstagram } from '@/hooks/useMeta'
import type { Caption } from '@/types'

interface Props {
  caption: Caption
  showFeedback?: boolean
}

export function CaptionCard({ caption, showFeedback = true }: Props) {
  const router = useRouter()
  const { data: linkedInStatus } = useLinkedInStatus()
  const { data: metaStatus } = useMetaStatus()
  const publish = useLinkedInPublish()
  const publishFb = usePublishFacebook()
  const publishIg = usePublishInstagram()

  const [published, setPublished] = useState(false)
  const [fbPublished, setFbPublished] = useState(false)
  const [igPublished, setIgPublished] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [igMissingImage, setIgMissingImage] = useState(false)

  const fullText =
    (caption.finalText ?? caption.generatedText) +
    (caption.hashtags.length > 0
      ? '\n\n' + caption.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : '')

  const handlePublish = async () => {
    await publish.mutateAsync({ captionId: caption.id, text: fullText })
    setPublished(true)
  }

  const handlePublishFacebook = async () => {
    await publishFb.mutateAsync({ captionId: caption.id, text: fullText, imageUrl: imageUrl || undefined })
    setFbPublished(true)
  }

  const handlePublishInstagram = async () => {
    if (!imageUrl) {
      setIgMissingImage(true)
      return
    }
    setIgMissingImage(false)
    await publishIg.mutateAsync({ captionId: caption.id, text: fullText, imageUrl })
    setIgPublished(true)
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

      {(metaStatus?.facebook.connected || metaStatus?.instagram.connected) && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <ImageUpload
            url={imageUrl}
            onUpload={setImageUrl}
            onRemove={() => { setImageUrl(''); setIgMissingImage(false) }}
          />
          {igMissingImage && (
            <p className="text-xs text-amber-600">A photo is required for Instagram.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showFeedback && <FeedbackButtons caption={caption} />}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
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
                {publish.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Linkedin className="h-3 w-3" />}
                Post to LinkedIn
              </button>
            )
          )}

          {metaStatus?.facebook.connected && (
            fbPublished ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to Facebook
              </div>
            ) : (
              <button
                onClick={handlePublishFacebook}
                disabled={publishFb.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1877F2] text-white rounded-lg hover:bg-[#1668d8] transition-colors disabled:opacity-50"
              >
                {publishFb.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Facebook className="h-3 w-3" />}
                Post to Facebook
              </button>
            )
          )}

          {metaStatus?.instagram.connected && (
            igPublished ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to Instagram
              </div>
            ) : (
              <button
                onClick={handlePublishInstagram}
                disabled={publishIg.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888)' }}
              >
                {publishIg.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Instagram className="h-3 w-3" />}
                Post to Instagram
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
