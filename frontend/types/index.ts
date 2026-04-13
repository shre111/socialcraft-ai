export type Language =
  | 'english'
  | 'hindi'
  | 'gujarati'
  | 'hinglish'
  | 'marathi'
  | 'punjabi'
  | 'tamil'

export type Tone =
  | 'funny'
  | 'professional'
  | 'emotional'
  | 'motivational'
  | 'casual'
  | 'promotional'

export type Platform =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'threads'
  | 'pinterest'

export type EmojiUsage = 'low' | 'medium' | 'high'

export type FeedbackType =
  | 'liked'
  | 'copied'
  | 'edited'
  | 'regenerated'
  | 'disliked'
  | 'published'

export interface Caption {
  id: string
  topic: string
  generatedText: string
  language: Language
  tone: Tone
  platform: Platform
  hashtags: string[]
  wasUsed: boolean
  wasLiked: boolean
  wasEdited: boolean
  finalText?: string
  createdAt: string
}

export interface UserProfile {
  id: string
  displayName: string
  preferredLanguage: Language
  preferredTone: Tone
  preferredPlatforms: Platform[]
  emojiUsage: EmojiUsage
  avgCaptionLength: number
  hashtagCount: number
}

export interface GenerateCaptionRequest {
  topic: string
  language: Language
  tone: Tone
  platform: Platform
  count?: number
}

export interface GenerateCaptionResponse {
  captions: Caption[]
  personalizationUsed: boolean
  confidenceScore: number
}

export interface FeedbackRequest {
  captionId: string
  feedbackType: FeedbackType
  editedText?: string
}

export interface UserMLProfile {
  predictedTone: Tone
  predictedLanguage: Language
  predictedEmojiLevel: EmojiUsage
  trainingDataPoints: number
  lastUpdated: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface ScheduledPost {
  id: string
  captionId: string
  platform: Platform
  scheduledAt: string
  status: 'pending' | 'published' | 'failed'
  platformPostId?: string
  createdAt: string
}
