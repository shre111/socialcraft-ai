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
import { CaptionCard } from '@/components/caption/CaptionCard'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { LANGUAGES, TONES, PLATFORMS, COLORS } from '@/constants'

export default function GenerateScreen() {
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
    } catch (e) {
      Alert.alert('Generation failed', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.screenBg]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]}
                style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </LinearGradient>
              <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800' }}>Generate Captions</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginLeft: 46 }}>
              AI-powered, personalised for you
            </Text>
          </View>

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

          <SectionLabel icon="phone-portrait-outline" label="Platform" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {PLATFORMS.map((p) => (
                <Chip key={p.value} label={p.label} selected={platform === p.value}
                  onPress={() => setPlatform(p.value)} color={p.color} />
              ))}
            </View>
          </ScrollView>

          <SectionLabel icon="language-outline" label="Language" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {LANGUAGES.map((l) => (
                <Chip key={l.value} label={l.label} selected={language === l.value}
                  onPress={() => setLanguage(l.value)} emoji={l.flag} />
              ))}
            </View>
          </ScrollView>

          <SectionLabel icon="happy-outline" label="Tone" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {TONES.map((t) => (
              <Chip key={t.value} label={t.label} selected={tone === t.value}
                onPress={() => setTone(t.value)} emoji={t.emoji} />
            ))}
          </View>

          <SectionLabel icon="copy-outline" label="Number of captions" />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setCount(n)}
                style={{
                  width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: count === n ? COLORS.primary : COLORS.border,
                  backgroundColor: count === n ? `${COLORS.primary}33` : 'rgba(45,31,94,0.3)',
                }}>
                <Text style={{ color: count === n ? COLORS.secondary : COLORS.muted, fontWeight: '700', fontSize: 15 }}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={loading ? 'Generating…' : 'Generate Captions'} onPress={generate} loading={loading}
            icon={<Ionicons name="sparkles" size={18} color="#fff" />} />

          {personalizationUsed && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
              backgroundColor: `${COLORS.primary}1a`, borderRadius: 12, padding: 12,
              borderWidth: 1, borderColor: `${COLORS.primary}4d` }}>
              <Ionicons name="analytics-outline" size={16} color={COLORS.secondary} />
              <Text style={{ color: COLORS.secondary, fontSize: 13, flex: 1 }}>
                AI personalization active · {Math.round(confidenceScore * 100)}% confidence
              </Text>
            </View>
          )}

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

function SectionLabel({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Ionicons name={icon} size={15} color={COLORS.muted} />
      <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  )
}
