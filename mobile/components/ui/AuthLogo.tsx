import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'

interface Props { subtitle: string }

export function AuthLogo({ subtitle }: Props) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 48 }}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]}
        style={{ width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Ionicons name="sparkles" size={36} color="#fff" />
      </LinearGradient>
      <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>SocialCraft AI</Text>
      <Text style={{ color: COLORS.muted, fontSize: 15, marginTop: 6 }}>{subtitle}</Text>
    </View>
  )
}
