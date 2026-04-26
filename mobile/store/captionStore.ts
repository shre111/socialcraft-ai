import { create } from 'zustand'

export interface Caption {
  id: string
  topic: string
  generatedText: string
  language: string
  tone: string
  platform: string
  hashtags: string[]
  wasLiked: boolean
  wasUsed: boolean
  wasEdited: boolean
  finalText?: string
  createdAt: string
}

interface CaptionStore {
  captions: Caption[]
  personalizationUsed: boolean
  confidenceScore: number
  setCaptions: (captions: Caption[], personalizationUsed: boolean, confidenceScore: number) => void
  updateCaption: (id: string, updates: Partial<Caption>) => void
  clear: () => void
}

export const useCaptionStore = create<CaptionStore>((set) => ({
  captions: [],
  personalizationUsed: false,
  confidenceScore: 0,
  setCaptions: (captions, personalizationUsed, confidenceScore) =>
    set({ captions, personalizationUsed, confidenceScore }),
  updateCaption: (id, updates) =>
    set((s) => ({ captions: s.captions.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
  clear: () => set({ captions: [], personalizationUsed: false, confidenceScore: 0 }),
}))
