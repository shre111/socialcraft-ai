'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse, Platform } from '@/types'

export interface ScheduledPost {
  id: string
  captionId: string
  platform: Platform
  scheduledAt: string
  status: 'pending' | 'published' | 'failed'
  platformPostId?: string
  createdAt: string
  captions?: {
    generatedText: string
    finalText?: string
    topic: string
  }
}

export interface ScheduleRequest {
  caption_id: string
  platform: Platform
  scheduled_at: string
}

export function useScheduledPosts() {
  return useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ScheduledPost[]>>('/api/publish/scheduled')
      return data.data
    },
    refetchInterval: 60_000,
  })
}

export function useSchedulePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ScheduleRequest) => {
      const { data } = await api.post<ApiResponse<ScheduledPost>>('/api/publish/schedule', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] })
    },
  })
}
