'use client'

import { useState } from 'react'
import {
  CalendarClock, Clock, CheckCircle2, XCircle,
  Loader2, Plus, Linkedin, Globe,
} from 'lucide-react'
import { useScheduledPosts, useSchedulePost } from '@/hooks/useScheduler'
import { useCaptionHistory } from '@/hooks/useCaption'
import { useLinkedInStatus } from '@/hooks/useLinkedIn'
import { formatDate } from '@/lib/utils'
import type { Platform } from '@/types'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="h-4 w-4 text-[#0A66C2]" />,
}

const STATUS_CONFIG = {
  pending:   { icon: Clock,         color: 'text-amber-600 bg-amber-50',  label: 'Pending' },
  published: { icon: CheckCircle2,  color: 'text-green-600 bg-green-50',  label: 'Published' },
  failed:    { icon: XCircle,       color: 'text-red-600 bg-red-50',      label: 'Failed' },
}

export default function SchedulerPage() {
  const { data: posts, isLoading } = useScheduledPosts()
  const { data: history } = useCaptionHistory()
  const { data: linkedIn } = useLinkedInStatus()
  const schedule = useSchedulePost()

  const [showForm, setShowForm] = useState(false)
  const [captionId, setCaptionId] = useState('')
  const [platform, setPlatform] = useState<Platform>('linkedin')
  const [scheduledAt, setScheduledAt] = useState('')
  const [done, setDone] = useState(false)

  const minDateTime = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await schedule.mutateAsync({
      caption_id: captionId,
      platform,
      scheduled_at: new Date(scheduledAt).toISOString(),
    })
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setShowForm(false)
      setCaptionId('')
      setScheduledAt('')
    }, 1500)
  }

  const pending = posts?.filter((p) => p.status === 'pending') ?? []
  const done_posts = posts?.filter((p) => p.status !== 'pending') ?? []

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post Scheduler</h1>
          <p className="text-gray-500 mt-1">
            Schedule captions to auto-publish. The backend checks every minute.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Schedule post
        </button>
      </div>

      {/* Schedule form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">New scheduled post</h2>

          {!linkedIn?.connected && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
              <Globe className="h-4 w-4 shrink-0" />
              Connect LinkedIn in Settings before scheduling.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Caption picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <select
                required
                value={captionId}
                onChange={(e) => setCaptionId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select a caption…</option>
                {history?.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.platform}] {c.topic} —{' '}
                    {(c.finalText ?? c.generatedText).slice(0, 60)}…
                  </option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <div className="flex gap-2">
                {(['linkedin'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm capitalize transition-colors ${
                      platform === p
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-gray-200 text-gray-600 hover:border-violet-300'
                    }`}
                  >
                    {PLATFORM_ICONS[p] ?? <Globe className="h-4 w-4" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish date & time
              </label>
              <input
                required
                type="datetime-local"
                min={minDateTime}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={schedule.isPending || !linkedIn?.connected}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {schedule.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarClock className="h-4 w-4" />
                )}
                {done ? 'Scheduled!' : 'Confirm schedule'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending posts */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Upcoming ({pending.length})
        </h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            No upcoming posts. Click "Schedule post" to add one.
          </div>
        ) : (
          pending.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>

      {/* Past posts */}
      {done_posts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Past ({done_posts.length})
          </h2>
          {done_posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  )
}

function PostCard({ post }: { post: ReturnType<typeof useScheduledPosts>['data'] extends (infer T)[] | undefined ? T : never }) {
  if (!post) return null
  const cfg = STATUS_CONFIG[post.status]
  const StatusIcon = cfg.icon
  const caption = post.captions
  const text = caption?.finalText ?? caption?.generatedText ?? ''

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 capitalize">
            {PLATFORM_ICONS[post.platform] ?? <Globe className="h-3.5 w-3.5" />}
            {post.platform}
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {formatDate(post.scheduledAt)}
          </span>
        </div>
        {caption?.topic && (
          <p className="text-xs text-gray-400 font-medium">Topic: {caption.topic}</p>
        )}
        {text && (
          <p className="text-sm text-gray-700 line-clamp-2">{text}</p>
        )}
      </div>
    </div>
  )
}
