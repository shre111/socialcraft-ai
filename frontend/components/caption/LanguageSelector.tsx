'use client'

import { LANGUAGES } from '@/constants'
import type { Language } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  value: Language
  onChange: (language: Language) => void
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => onChange(lang.value as Language)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors text-left',
              value === lang.value
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 font-medium'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 hover:bg-violet-50/40 dark:hover:bg-violet-950/40',
            )}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="truncate">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
