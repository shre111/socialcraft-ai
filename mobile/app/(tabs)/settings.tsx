import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useCaptionStore } from '@/store/captionStore'
import { COLORS } from '@/constants'

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const clear = useCaptionStore((s) => s.clear)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          setUser(null)
          clear()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const menuItems: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; tint: string }[] = [
    { icon: 'person-outline', label: 'Account', value: user?.email ?? '', tint: COLORS.secondary },
    { icon: 'logo-linkedin', label: 'LinkedIn', value: 'Manage on web app', tint: '#0A66C2' },
    { icon: 'bar-chart-outline', label: 'Analytics', value: 'View on web app', tint: COLORS.primary },
    { icon: 'shield-checkmark-outline', label: 'Privacy', value: 'Your data is private', tint: COLORS.success },
  ]

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.screenBg]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <LinearGradient colors={[COLORS.iconBg, COLORS.border]}
              style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="settings-outline" size={18} color={COLORS.secondary} />
            </LinearGradient>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800' }}>Settings</Text>
          </View>

          <LinearGradient colors={['#1e1040', '#2a0f50']}
            style={{ borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]}
              style={{ width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>
                {user?.email?.split('@')[0] ?? 'User'}
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{user?.email}</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(124,58,237,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 }}>
              <Text style={{ color: COLORS.secondary, fontSize: 12, fontWeight: '700' }}>PRO</Text>
            </View>
          </LinearGradient>

          <View style={{ backgroundColor: 'rgba(26,16,53,0.8)', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 20 }}>
            {menuItems.map((item, i) => (
              <View key={item.label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${item.tint}22`, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={item.icon} size={18} color={item.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>{item.label}</Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 1 }} numberOfLines={1}>{item.value}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
                </View>
                {i < menuItems.length - 1 && (
                  <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 }} />
                )}
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: 'rgba(26,16,53,0.5)', borderRadius: 16, padding: 16, marginBottom: 20, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Version</Text>
              <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600' }}>1.0.0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Backend</Text>
              <Text style={{ color: COLORS.success, fontSize: 13, fontWeight: '600' }}>Connected</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>AI Model</Text>
              <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600' }}>Claude Sonnet 4.6</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)', padding: 16 }}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={{ color: COLORS.error, fontSize: 16, fontWeight: '700' }}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}
