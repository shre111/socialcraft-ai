import { TouchableOpacity, Text } from 'react-native'
import { COLORS } from '@/constants'

interface Props {
  label: string
  selected: boolean
  onPress: () => void
  emoji?: string
  color?: string
}

export function Chip({ label, selected, onPress, emoji, color }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: selected ? (color ?? COLORS.primary) : COLORS.border,
        backgroundColor: selected
          ? `${color ?? COLORS.primary}22`
          : 'rgba(45, 31, 94, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {emoji && <Text style={{ fontSize: 13 }}>{emoji}</Text>}
      <Text
        style={{
          color: selected ? (color ?? COLORS.secondary) : COLORS.muted,
          fontSize: 13,
          fontWeight: selected ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
