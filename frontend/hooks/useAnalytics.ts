'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface AnalyticsSummary {
  totals: {
    captions: number
    liked: number
    used: number
    edited: number
    published: number
    events: number
  }
  eventCounts: Record<string, number>
  captionsPerDay: { date: string; count: number }[]
  topPlatforms: { platform: string; count: number }[]
  topTones: { tone: string; count: number }[]
  topLanguages: { language: string; count: number }[]
  engagementByPlatform: { platform: string; liked: number; total: number }[]
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AnalyticsSummary>>('/api/analytics/summary')
      return data.data
    },
    staleTime: 60_000,
  })
}
