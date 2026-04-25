import axios from 'axios'
import { createClient } from '@/lib/supabase'
import { API_BASE_URL } from '@/constants'

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function keysToCamel<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(keysToCamel) as unknown as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), keysToCamel(v)])
    ) as T
  }
  return obj
}

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
  (res) => {
    res.data = keysToCamel(res.data)
    return res
  },
  (err) => {
    const message: string =
      err.response?.data?.error ?? err.message ?? 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export default api
