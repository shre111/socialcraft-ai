import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@/constants'

interface Props {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', icon, fullWidth = true }: Props) {
  const isDisabled = disabled || loading

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.8}
        style={{ width: fullWidth ? '100%' : 'auto', opacity: isDisabled ? 0.5 : 1 }}>
        <LinearGradient
          colors={['#7c3aed', '#6d28d9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ borderRadius: 14, paddingVertical: 15, paddingHorizontal: 24,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : icon}
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.8}
        style={{
          width: fullWidth ? '100%' : 'auto', opacity: isDisabled ? 0.5 : 1,
          borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary,
          paddingVertical: 14, paddingHorizontal: 24,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
        {loading ? <ActivityIndicator color={COLORS.primary} size="small" /> : icon}
        <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>{title}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.7}
      style={{ opacity: isDisabled ? 0.5 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={{ color: COLORS.muted, fontSize: 14, fontWeight: '500' }}>{title}</Text>
    </TouchableOpacity>
  )
}
