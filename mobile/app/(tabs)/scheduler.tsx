import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { COLORS } from '@/constants'

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  published: COLORS.success,
  failed: COLORS.error,
}

export default function SchedulerScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['scheduled'],
    queryFn: async () => {
      const { data } = await api.get('/api/publish/scheduled')
      return data.data
    },
    refetchInterval: 30000,
  })

  return (
    <LinearGradient colors={['#0f0a1e', '#130828']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LinearGradient colors={['#1e1040', '#2d1f5e']}
              style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
            </LinearGradient>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800' }}>Scheduled Posts</Text>
          </View>
          <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 4, marginLeft: 46 }}>
            Posts auto-publish every minute
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !data?.length ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
            <Text style={{ color: COLORS.muted, fontSize: 16, fontWeight: '600' }}>No scheduled posts</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
              Schedule posts from the web app's Scheduler page
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <View style={{
                backgroundColor: 'rgba(26,16,53,0.9)', borderRadius: 16,
                borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
                    <Text style={{ color: COLORS.text, fontWeight: '700', textTransform: 'capitalize' }}>
                      {item.platform}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: `${STATUS_COLORS[item.status]}22`,
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STATUS_COLORS[item.status] }} />
                    <Text style={{ color: STATUS_COLORS[item.status], fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>
                  Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                </Text>
                {item.captions?.generatedText && (
                  <Text style={{ color: COLORS.text, fontSize: 14, lineHeight: 20 }} numberOfLines={2}>
                    {item.captions.finalText ?? item.captions.generatedText}
                  </Text>
                )}
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}
