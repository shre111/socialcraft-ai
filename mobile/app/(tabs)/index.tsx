import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { useCaptionStore } from '@/store/captionStore'
import { useAuthStore } from '@/store/authStore'
import { CaptionCard } from '@/components/caption/CaptionCard'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { LANGUAGES, TONES, PLATFORMS, COLORS } from '@/constants'

export default function GenerateScreen() {
  const user = useAuthStore((s) => s.user)
  const { captions, setCaptions, personalizationUsed, confidenceScore } = useCaptionStore()

  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('english')
  const [tone, setTone] = useState('casual')
  const [platform, setPlatform] = useState('instagram')
  const [count, setCount] = useState(3)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!topic.trim()) return Alert.alert('Topic required', 'Please enter a topic to generate captions.')
    setLoading(true)
    try {
      const { data } = await api.post('/api/captions/generate', { topic, language, tone, platform, count })
      setCaptions(data.data.captions, data.data.personalizationUsed, data.data.confidenceScore)
    } catch (e: any) {
      Alert.alert('Generation failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#0f0a1e', '#130828']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <LinearGradient colors={['#7c3aed', '#a855f7']}
                style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </LinearGradient>
              <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800' }}>Generate Captions</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginLeft: 46 }}>
              AI-powered, personalised for you
            </Text>
          </View>

          {/* Topic input */}
          <View style={{
            backgroundColor: 'rgba(45,31,94,0.4)', borderRadius: 16,
            borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 20,
          }}>
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="What's your post about? (e.g. Diwali sale, gym motivation...)"
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={300}
              style={{ color: COLORS.text, fontSize: 15, padding: 16, minHeight: 90, textAlignVertical: 'top' }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>{topic.length}/300</Text>
            </View>
          </View>

          {/* Platform */}
          <SectionLabel icon="phone-portrait-outline" label="Platform" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {PLATFORMS.map((p) => (
                <Chip key={p.value} label={p.label} selected={platform === p.value}
                  onPress={() => setPlatform(p.value)} color={p.color} />
              ))}
            </View>
          </ScrollView>

          {/* Language */}
          <SectionLabel icon="language-outline" label="Language" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {LANGUAGES.map((l) => (
                <Chip key={l.value} label={l.label} selected={language === l.value}
                  onPress={() => setLanguage(l.value)} emoji={l.flag} />
              ))}
            </View>
          </ScrollView>

          {/* Tone */}
          <SectionLabel icon="happy-outline" label="Tone" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {TONES.map((t) => (
              <Chip key={t.value} label={t.label} selected={tone === t.value}
                onPress={() => setTone(t.value)} emoji={t.emoji} />
            ))}
          </View>

          {/* Count */}
          <SectionLabel icon="copy-outline" label="Number of captions" />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setCount(n)}
                style={{
                  width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: count === n ? COLORS.primary : COLORS.border,
                  backgroundColor: count === n ? 'rgba(124,58,237,0.2)' : 'rgba(45,31,94,0.3)',
                }}>
                <Text style={{ color: count === n ? COLORS.secondary : COLORS.muted, fontWeight: '700', fontSize: 15 }}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={loading ? 'Generating…' : 'Generate Captions'} onPress={generate} loading={loading}
            icon={<Ionicons name="sparkles" size={18} color="#fff" />} />

          {/* Personalization badge */}
          {personalizationUsed && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
              backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 12, padding: 12,
              borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' }}>
              <Ionicons name="analytics-outline" size={16} color={COLORS.secondary} />
              <Text style={{ color: COLORS.secondary, fontSize: 13, flex: 1 }}>
                AI personalization active · {Math.round(confidenceScore * 100)}% confidence
              </Text>
            </View>
          )}

          {/* Results */}
          {captions.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 14 }}>
                {captions.length} Caption{captions.length > 1 ? 's' : ''} Generated
              </Text>
              {captions.map((cap) => <CaptionCard key={cap.id} caption={cap} />)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Ionicons name={icon as any} size={15} color={COLORS.muted} />
      <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  )
}
