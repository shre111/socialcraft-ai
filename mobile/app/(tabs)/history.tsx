import { useCallback } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { CaptionCard } from '@/components/caption/CaptionCard'
import { COLORS } from '@/constants'

export default function HistoryScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const { data } = await api.get('/api/captions/history?limit=50')
      return (data.data as any[]).map((item) => ({
        ...item,
        wasLiked: item.wasLiked ?? false,
        wasUsed: item.wasUsed ?? false,
        wasEdited: item.wasEdited ?? false,
      }))
    },
  })

  const renderItem = useCallback(({ item }: { item: any }) => <CaptionCard caption={item} />, [])

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.screenBg]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LinearGradient colors={[COLORS.iconBg, COLORS.border]}
              style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={18} color={COLORS.secondary} />
            </LinearGradient>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800' }}>History</Text>
          </View>
          <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 4, marginLeft: 46 }}>
            All your generated captions
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !data?.length ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.border} />
            <Text style={{ color: COLORS.muted, fontSize: 16, fontWeight: '600' }}>No captions yet</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
              Generate your first caption from the Generate tab
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}
