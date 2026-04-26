'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Save, Linkedin, CheckCircle2, XCircle } from 'lucide-react'
import { useUserProfile, useUpdatePreferences, useMLProfile } from '@/hooks/useUserPreferences'
import { useLinkedInStatus, useLinkedInConnect, useLinkedInDisconnect } from '@/hooks/useLinkedIn'
import { LANGUAGES, TONES, PLATFORMS } from '@/constants'
import type { Language, Tone, Platform, EmojiUsage } from '@/types'

// Isolated so useSearchParams is inside a Suspense boundary
function LinkedInBanner() {
  const params = useSearchParams()
  const p = params.get('linkedin')
  if (p === 'connected')
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        LinkedIn connected successfully!
      </div>
    )
  if (p === 'error')
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
        <XCircle className="h-4 w-4 shrink-0" />
        LinkedIn connection failed. Please try again.
      </div>
    )
  return null
}

function LinkedInCard() {
  const { data: status, isLoading } = useLinkedInStatus()
  const connect = useLinkedInConnect()
  const disconnect = useLinkedInDisconnect()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Connected Accounts</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0A66C2] rounded-lg flex items-center justify-center">
            <Linkedin className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">LinkedIn</p>
            <p className="text-xs text-gray-400">
              {isLoading
                ? 'Checking…'
                : status?.connected
                ? `Connected as ${status.username}`
                : 'Not connected'}
            </p>
          </div>
        </div>

        {status?.connected ? (
          <button
            onClick={() => disconnect.mutate()}
            disabled={disconnect.isPending}
            className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {disconnect.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Disconnect'}
          </button>
        ) : (
          <button
            onClick={() => connect.mutate()}
            disabled={connect.isPending || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors disabled:opacity-50"
          >
            {connect.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Linkedin className="h-4 w-4" />
            )}
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile()
  const { data: mlProfile } = useMLProfile()
  const update = useUpdatePreferences()

  const [lang, setLang] = useState<Language>('english')
  const [tone, setTone] = useState<Tone>('casual')
  const [emoji, setEmoji] = useState<EmojiUsage>('medium')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setLang(profile.preferredLanguage)
      setTone(profile.preferredTone)
      setEmoji(profile.emojiUsage)
      setPlatforms(profile.preferredPlatforms)
    }
  }, [profile])

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  const handleSave = async () => {
    await update.mutateAsync({
      preferredLanguage: lang,
      preferredTone: tone,
      emojiUsage: emoji,
      preferredPlatforms: platforms,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Personalise your default caption preferences.</p>
      </div>

      <Suspense fallback={null}>
        <LinkedInBanner />
      </Suspense>

      <LinkedInCard />

      {mlProfile && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
          <h2 className="font-semibold text-violet-900 mb-3">Your AI Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Stat label="Predicted tone" value={mlProfile.predictedTone} />
            <Stat label="Predicted language" value={mlProfile.predictedLanguage} />
            <Stat label="Emoji level" value={mlProfile.predictedEmojiLevel} />
            <Stat label="Training data" value={`${mlProfile.trainingDataPoints} events`} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value as Tone)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  tone === t.value
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emoji usage</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as EmojiUsage[]).map((level) => (
              <button
                key={level}
                onClick={() => setEmoji(level)}
                className={`flex-1 py-2 rounded-lg text-sm border capitalize transition-colors ${
                  emoji === level
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => togglePlatform(p.value as Platform)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  platforms.includes(p.value as Platform)
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={update.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-violet-600 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-semibold capitalize mt-0.5">{value}</p>
    </div>
  )
}
