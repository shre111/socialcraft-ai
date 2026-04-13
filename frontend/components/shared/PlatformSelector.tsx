'use client'

import { PLATFORMS } from '@/constants'
import type { Platform } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  value: Platform
  onChange: (platform: Platform) => void
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook:  '👥',
  youtube:   '▶️',
  linkedin:  '💼',
  threads:   '🧵',
  pinterest: '📌',
}

export function PlatformSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value as Platform)}
            className={cn(
              'flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-colors',
              value === p.value
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50/30',
              !p.free && 'opacity-60 cursor-not-allowed',
            )}
            disabled={!p.free}
            title={!p.free ? 'Coming soon' : undefined}
          >
            <span className="text-xl">{PLATFORM_ICONS[p.value]}</span>
            <span>{p.label}</span>
            {!p.free && (
              <span className="text-[10px] text-gray-400 leading-none">soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
