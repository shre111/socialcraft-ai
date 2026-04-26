import { TextInput, Text, View, type TextInputProps } from 'react-native'
import { COLORS } from '@/constants'

interface Props extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
          {label.toUpperCase()}
        </Text>
      )}
      <TextInput
        placeholderTextColor={COLORS.muted}
        style={[
          {
            backgroundColor: 'rgba(45, 31, 94, 0.4)',
            borderWidth: 1.5,
            borderColor: error ? COLORS.error : COLORS.border,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: COLORS.text,
            fontSize: 15,
          },
          style,
        ]}
        {...props}
      />
      {error && <Text style={{ color: COLORS.error, fontSize: 12 }}>{error}</Text>}
    </View>
  )
}
