'use client'

import { TONES, TONE_COLORS } from '@/constants'
import type { Tone } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  value: Tone
  onChange: (tone: Tone) => void
}

export function ToneSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value as Tone)}
            className={cn(
              'px-4 py-2 rounded-full border text-sm font-medium transition-colors',
              value === tone.value
                ? 'border-violet-600 bg-violet-600 text-white'
                : `border ${TONE_COLORS[tone.color]} border-current`,
            )}
          >
            {tone.label}
          </button>
        ))}
      </div>
    </div>
  )
}
