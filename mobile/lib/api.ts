import axios from 'axios'
import { supabase } from './supabase'
import { API_BASE_URL } from '@/constants'

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}
function keysToCamel<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(keysToCamel) as unknown as T
  if (obj !== null && typeof obj === 'object')
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), keysToCamel(v)])) as T
  return obj
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => { res.data = keysToCamel(res.data); return res },
  (err) => Promise.reject(new Error(err.response?.data?.detail ?? err.message ?? 'Request failed'))
)

export default api
