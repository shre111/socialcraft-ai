import { create } from 'zustand'
import type { Caption, Language, Tone, Platform } from '@/types'

interface CaptionState {
  topic: string
  imageBase64: string
  imageMediaType: string
  language: Language
  tone: Tone
  platform: Platform
  count: number

  captions: Caption[]
  personalizationUsed: boolean
  confidenceScore: number

  setTopic: (topic: string) => void
  setImage: (base64: string, mediaType: string) => void
  clearImage: () => void
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
  imageBase64: '',
  imageMediaType: '',
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
  setImage: (imageBase64, imageMediaType) => set({ imageBase64, imageMediaType }),
  clearImage: () => set({ imageBase64: '', imageMediaType: '' }),
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
