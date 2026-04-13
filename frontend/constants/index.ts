export const LANGUAGES = [
  { value: 'english',  label: 'English',           flag: '🇬🇧' },
  { value: 'hindi',    label: 'Hindi (हिंदी)',       flag: '🇮🇳' },
  { value: 'gujarati', label: 'Gujarati (ગુજરાતી)',  flag: '🇮🇳' },
  { value: 'hinglish', label: 'Hinglish',           flag: '🔀' },
  { value: 'marathi',  label: 'Marathi (मराठी)',     flag: '🇮🇳' },
  { value: 'punjabi',  label: 'Punjabi (ਪੰਜਾਬੀ)',    flag: '🇮🇳' },
  { value: 'tamil',    label: 'Tamil (தமிழ்)',       flag: '🇮🇳' },
] as const

export const TONES = [
  { value: 'funny',        label: 'Funny 😂',        color: 'yellow' },
  { value: 'professional', label: 'Professional 💼', color: 'blue' },
  { value: 'emotional',    label: 'Emotional 💕',    color: 'pink' },
  { value: 'motivational', label: 'Motivational 🔥', color: 'orange' },
  { value: 'casual',       label: 'Casual 😎',       color: 'green' },
  { value: 'promotional',  label: 'Promotional 📢',  color: 'purple' },
] as const

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: 'instagram', free: true },
  { value: 'facebook',  label: 'Facebook',  icon: 'facebook',  free: true },
  { value: 'youtube',   label: 'YouTube',   icon: 'youtube',   free: true },
  { value: 'linkedin',  label: 'LinkedIn',  icon: 'linkedin',  free: true },
  { value: 'threads',   label: 'Threads',   icon: 'threads',   free: true },
  { value: 'pinterest', label: 'Pinterest', icon: 'pinterest', free: false },
] as const

export const TONE_COLORS: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
  blue:   'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
  pink:   'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
  green:  'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
}

export const FREE_TIER_LIMIT = 10
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
