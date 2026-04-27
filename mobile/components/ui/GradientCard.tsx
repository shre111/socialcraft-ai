import { LinearGradient } from 'expo-linear-gradient'
import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { COLORS } from '@/constants'

interface Props extends ViewProps {
  children: React.ReactNode
  gradient?: string[]
  style?: StyleProp<ViewStyle>
}

export function GradientCard({ children, gradient, style, ...props }: Props) {
  return (
    <LinearGradient
      colors={(gradient as [string, string, ...string[]]) ?? [COLORS.card, COLORS.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <View style={{ padding: 20 }}>{children}</View>
    </LinearGradient>
  )
}

export function GlassCard({ children, style, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(26, 16, 53, 0.8)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(124, 58, 237, 0.3)',
          padding: 20,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
