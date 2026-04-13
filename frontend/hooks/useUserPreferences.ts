'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useUserStore } from '@/store/userStore'
import type { UserProfile, UserMLProfile, ApiResponse } from '@/types'

export function useUserProfile() {
  const { setProfile } = useUserStore()

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserProfile>>('/api/users/profile')
      setProfile(data.data)
      return data.data
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { setProfile } = useUserStore()

  return useMutation({
    mutationFn: async (preferences: Partial<UserProfile>) => {
      const { data } = await api.put<ApiResponse<UserProfile>>(
        '/api/users/preferences',
        preferences,
      )
      return data.data
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useMLProfile() {
  const { setMLProfile } = useUserStore()

  return useQuery({
    queryKey: ['ml-profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserMLProfile>>('/api/ml/profile')
      setMLProfile(data.data)
      return data.data
    },
  })
}
