// 10.0.2.2 = localhost on Android emulator
// Change to your PC's local IP if using a real phone e.g. 192.168.1.x
export const API_BASE_URL = 'http://10.0.2.2:8000'

export const SUPABASE_URL = 'https://xvoqfpjdxfgvrxlywkfv.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_hwPKPVhzG3eBSIBByRKH9Q_uo3ASdl7'

export const LANGUAGES = [
  { label: 'English',   value: 'english',   flag: '🇬🇧' },
  { label: 'Hindi',     value: 'hindi',     flag: '🇮🇳' },
  { label: 'Gujarati',  value: 'gujarati',  flag: '🇮🇳' },
  { label: 'Hinglish',  value: 'hinglish',  flag: '🌐' },
  { label: 'Marathi',   value: 'marathi',   flag: '🇮🇳' },
  { label: 'Punjabi',   value: 'punjabi',   flag: '🇮🇳' },
  { label: 'Tamil',     value: 'tamil',     flag: '🇮🇳' },
]

export const TONES = [
  { label: 'Funny',         value: 'funny',         emoji: '😂' },
  { label: 'Professional',  value: 'professional',  emoji: '💼' },
  { label: 'Emotional',     value: 'emotional',     emoji: '❤️' },
  { label: 'Motivational',  value: 'motivational',  emoji: '🔥' },
  { label: 'Casual',        value: 'casual',        emoji: '😊' },
  { label: 'Promotional',   value: 'promotional',   emoji: '📢' },
]

export const PLATFORMS = [
  { label: 'Instagram', value: 'instagram', color: '#E1306C' },
  { label: 'LinkedIn',  value: 'linkedin',  color: '#0A66C2' },
  { label: 'Facebook',  value: 'facebook',  color: '#1877F2' },
  { label: 'YouTube',   value: 'youtube',   color: '#FF0000' },
  { label: 'Threads',   value: 'threads',   color: '#000000' },
]

export const COLORS = {
  primary:     '#7c3aed',
  primaryDark: '#6d28d9',
  secondary:   '#a855f7',
  dark:        '#0f0a1e',
  screenBg:    '#130828',
  authBg:      '#1a0535',
  iconBg:      '#1e1040',
  card:        '#1a1035',
  border:      '#2d1f5e',
  surface:     '#16082e',
  text:        '#f3f0ff',
  muted:       '#9ca3af',
  success:     '#10b981',
  error:       '#ef4444',
  warning:     '#f59e0b',
  like:        '#ec4899',
}
