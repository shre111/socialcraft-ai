import axios from 'axios'
import { createClient } from '@/lib/supabase'
import { API_BASE_URL } from '@/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message: string =
      err.response?.data?.error ?? err.message ?? 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export default api
