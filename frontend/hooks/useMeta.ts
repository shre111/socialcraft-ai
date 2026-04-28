'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

interface MetaStatus {
  facebook: { connected: boolean; username?: string }
  instagram: { connected: boolean; username?: string }
}

export function useMetaStatus() {
  return useQuery({
    queryKey: ['meta-status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MetaStatus>>('/api/meta/status')
      return data.data
    },
  })
}

export function useMetaConnect() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get<ApiResponse<{ url: string }>>('/api/meta/connect')
      return data.data.url
    },
    onSuccess: (url) => {
      window.location.href = url
    },
  })
}

export function useMetaDisconnect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete('/api/meta/disconnect')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-status'] })
    },
  })
}

export function usePublishFacebook() {
  return useMutation({
    mutationFn: async ({ captionId, text }: { captionId: string; text: string }) => {
      const { data } = await api.post<ApiResponse<{ postId: string }>>('/api/meta/publish/facebook', {
        caption_id: captionId,
        text,
      })
      return data.data
    },
  })
}

export function usePublishInstagram() {
  return useMutation({
    mutationFn: async ({ captionId, text, imageUrl }: { captionId: string; text: string; imageUrl: string }) => {
      const { data } = await api.post<ApiResponse<{ postId: string }>>('/api/meta/publish/instagram', {
        caption_id: captionId,
        text,
        image_url: imageUrl,
      })
      return data.data
    },
  })
}
