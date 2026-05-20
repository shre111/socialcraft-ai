'use client'

import { useState } from 'react'
import { Linkedin, Loader2, CheckCircle2, CalendarClock, Facebook, Instagram, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FeedbackButtons } from './FeedbackButtons'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { formatDate } from '@/lib/utils'
import { useLinkedInStatus, useLinkedInPublish } from '@/hooks/useLinkedIn'
import { useMetaStatus, usePublishFacebook, usePublishInstagram } from '@/hooks/useMeta'
import { useDeleteCaption } from '@/hooks/useCaption'
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

  const deleteCaption = useDeleteCaption()
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
    try {
      await publish.mutateAsync({ captionId: caption.id, text: fullText })
      setPublished(true)
    } catch {
      // error rendered via publish.isError below
    }
  }

  const handlePublishFacebook = async () => {
    try {
      await publishFb.mutateAsync({ captionId: caption.id, text: fullText, imageUrl: imageUrl || undefined })
      setFbPublished(true)
    } catch {
      // error rendered via publishFb.isError below
    }
  }

  const handlePublishInstagram = async () => {
    if (!imageUrl) {
      setIgMissingImage(true)
      return
    }
    setIgMissingImage(false)
    try {
      await publishIg.mutateAsync({ captionId: caption.id, text: fullText, imageUrl })
      setIgPublished(true)
    } catch {
      // error rendered via publishIg.isError below
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 rounded-full font-medium capitalize">
          {caption.language}
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full capitalize">
          {caption.tone}
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full capitalize">
          {caption.platform}
        </span>
        <span className="ml-auto text-gray-400 dark:text-gray-500">{formatDate(caption.createdAt)}</span>
      </div>

      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-sm leading-relaxed">
        {caption.finalText ?? caption.generatedText}
      </p>

      {caption.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {caption.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Topic: <span className="italic">{caption.topic}</span>
      </p>

      {(metaStatus?.facebook.connected || metaStatus?.instagram.connected) && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
          <ImageUpload
            url={imageUrl}
            onUpload={setImageUrl}
            onRemove={() => { setImageUrl(''); setIgMissingImage(false) }}
          />
          {igMissingImage && (
            <p className="text-xs text-amber-600 dark:text-amber-400">A photo is required for Instagram.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showFeedback && <FeedbackButtons caption={caption} />}

        {!showFeedback && (
          <button
            onClick={() => deleteCaption.mutate(caption.id)}
            disabled={deleteCaption.isPending}
            title="Delete caption"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
          >
            {deleteCaption.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            Delete
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={() => router.push('/dashboard/scheduler')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <CalendarClock className="h-3 w-3" />
            Schedule
          </button>

          {linkedInStatus?.connected && (
            published ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to LinkedIn
              </div>
            ) : publish.isError ? (
              <span className="text-xs text-red-500 dark:text-red-400">LinkedIn failed — try again</span>
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
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to Facebook
              </div>
            ) : publishFb.isError ? (
              <span className="text-xs text-red-500 dark:text-red-400">Facebook failed — try again</span>
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
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Posted to Instagram
              </div>
            ) : publishIg.isError ? (
              <span className="text-xs text-red-500 dark:text-red-400">Instagram failed — try again</span>
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
