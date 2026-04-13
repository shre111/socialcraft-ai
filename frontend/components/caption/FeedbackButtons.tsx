'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Copy, Pencil, Check } from 'lucide-react'
import { useSubmitFeedback } from '@/hooks/useCaption'
import { copyToClipboard } from '@/lib/utils'
import type { Caption } from '@/types'

interface Props {
  caption: Caption
}

export function FeedbackButtons({ caption }: Props) {
  const { mutate: submitFeedback, isPending } = useSubmitFeedback()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(caption.finalText ?? caption.generatedText)
  const [liked, setLiked] = useState(caption.wasLiked)
  const [disliked, setDisliked] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(caption.finalText ?? caption.generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    submitFeedback({ captionId: caption.id, feedbackType: 'copied' })
  }

  const handleLike = () => {
    setLiked(true)
    setDisliked(false)
    submitFeedback({ captionId: caption.id, feedbackType: 'liked' })
  }

  const handleDislike = () => {
    setDisliked(true)
    setLiked(false)
    submitFeedback({ captionId: caption.id, feedbackType: 'disliked' })
  }

  const handleSaveEdit = () => {
    submitFeedback({
      captionId: caption.id,
      feedbackType: 'edited',
      editedText: editText,
    })
    setEditing(false)
  }

  return (
    <div className="space-y-3">
      {editing && (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={isPending}
          title="Like"
          className={`p-2 rounded-lg border transition-colors ${
            liked
              ? 'bg-green-50 border-green-400 text-green-600'
              : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleDislike}
          disabled={isPending}
          title="Dislike"
          className={`p-2 rounded-lg border transition-colors ${
            disliked
              ? 'bg-red-50 border-red-400 text-red-600'
              : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => setEditing((v) => !v)}
          title="Edit"
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleCopy}
          title="Copy"
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
