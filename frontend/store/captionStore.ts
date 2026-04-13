import { create } from 'zustand'
import type { Caption, Language, Tone, Platform } from '@/types'

interface CaptionState {
  // Form values
  topic: string
  language: Language
  tone: Tone
  platform: Platform
  count: number

  // Results
  captions: Caption[]
  personalizationUsed: boolean
  confidenceScore: number

  // Actions
  setTopic: (topic: string) => void
  setLanguage: (language: Language) => void
  setTone: (tone: Tone) => void
  setPlatform: (platform: Platform) => void
  setCount: (count: number) => void
  setCaptions: (captions: Caption[], personalizationUsed: boolean, confidenceScore: number) => void
  updateCaption: (id: string, updates: Partial<Caption>) => void
  reset: () => void
}

const defaults = {
  topic: '',
  language: 'english' as Language,
  tone: 'casual' as Tone,
  platform: 'instagram' as Platform,
  count: 3,
  captions: [],
  personalizationUsed: false,
  confidenceScore: 0,
}

export const useCaptionStore = create<CaptionState>((set) => ({
  ...defaults,

  setTopic: (topic) => set({ topic }),
  setLanguage: (language) => set({ language }),
  setTone: (tone) => set({ tone }),
  setPlatform: (platform) => set({ platform }),
  setCount: (count) => set({ count }),

  setCaptions: (captions, personalizationUsed, confidenceScore) =>
    set({ captions, personalizationUsed, confidenceScore }),

  updateCaption: (id, updates) =>
    set((state) => ({
      captions: state.captions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  reset: () => set(defaults),
}))
