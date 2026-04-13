'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCaptionStore } from '@/store/captionStore'
import type {
  GenerateCaptionRequest,
  GenerateCaptionResponse,
  FeedbackRequest,
  Caption,
  ApiResponse,
} from '@/types'

export function useGenerateCaptions() {
  const { setCaptions } = useCaptionStore()

  return useMutation({
    mutationFn: async (payload: GenerateCaptionRequest) => {
      const { data } = await api.post<ApiResponse<GenerateCaptionResponse>>(
        '/api/captions/generate',
        payload,
      )
      return data.data
    },
    onSuccess: (data) => {
      setCaptions(data.captions, data.personalizationUsed, data.confidenceScore)
    },
  })
}

export function useCaptionHistory() {
  return useQuery({
    queryKey: ['caption-history'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Caption[]>>('/api/captions/history')
      return data.data
    },
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  const { updateCaption } = useCaptionStore()

  return useMutation({
    mutationFn: async (payload: FeedbackRequest) => {
      const { data } = await api.post<ApiResponse<{ ok: boolean }>>(
        '/api/captions/feedback',
        payload,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      if (variables.feedbackType === 'liked') {
        updateCaption(variables.captionId, { wasLiked: true })
      }
      if (variables.feedbackType === 'edited' && variables.editedText) {
        updateCaption(variables.captionId, { wasEdited: true, finalText: variables.editedText })
      }
      queryClient.invalidateQueries({ queryKey: ['caption-history'] })
    },
  })
}
