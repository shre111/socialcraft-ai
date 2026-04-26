'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

interface LinkedInStatus {
  connected: boolean
  username?: string
  expiresAt?: string
}

interface PublishResult {
  postId: string
}

export function useLinkedInStatus() {
  return useQuery({
    queryKey: ['linkedin-status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LinkedInStatus>>('/api/linkedin/status')
      return data.data
    },
  })
}

export function useLinkedInConnect() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get<ApiResponse<{ url: string }>>('/api/linkedin/connect')
      return data.data.url
    },
    onSuccess: (url) => {
      window.location.href = url
    },
  })
}

export function useLinkedInDisconnect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete('/api/linkedin/disconnect')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-status'] })
    },
  })
}

export function useLinkedInPublish() {
  return useMutation({
    mutationFn: async ({ captionId, text }: { captionId: string; text: string }) => {
      const { data } = await api.post<ApiResponse<PublishResult>>('/api/linkedin/publish', {
        caption_id: captionId,
        text,
      })
      return data.data
    },
  })
}
