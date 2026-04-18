'use client'

import { useCaptionHistory } from '@/hooks/useCaption'
import { CaptionCard } from '@/components/caption/CaptionCard'
import { Loader2, HistoryIcon } from 'lucide-react'

export default function HistoryPage() {
  const { data: captions, isLoading, error } = useCaptionHistory()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caption History</h1>
        <p className="text-gray-500 mt-1">All captions you&apos;ve generated.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading history…</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Failed to load history. Please refresh.
        </div>
      )}

      {captions && captions.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No captions yet</p>
          <p className="text-sm mt-1">Generate your first caption to see it here.</p>
        </div>
      )}

      {captions && captions.length > 0 && (
        <div className="grid gap-4">
          {captions.map((caption) => (
            <CaptionCard key={caption.id} caption={caption} showFeedback={false} />
          ))}
        </div>
      )}
    </div>
  )
}
