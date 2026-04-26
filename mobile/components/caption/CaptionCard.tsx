import { View, Text, TouchableOpacity, Share, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import api from '@/lib/api'
import { useCaptionStore, type Caption } from '@/store/captionStore'
import { COLORS } from '@/constants'

interface Props { caption: Caption }

export function CaptionCard({ caption }: Props) {
  const updateCaption = useCaptionStore((s) => s.updateCaption)
  const fullText = (caption.finalText ?? caption.generatedText) +
    (caption.hashtags.length > 0 ? '\n\n' + caption.hashtags.map((h) => h.startsWith('#') ? h : `#${h}`).join(' ') : '')

  const handleLike = async () => {
    try {
      await api.post('/api/captions/feedback', { caption_id: caption.id, feedback_type: 'liked' })
      updateCaption(caption.id, { wasLiked: true })
    } catch {}
  }

  const handleCopy = async () => {
    await Share.share({ message: fullText })
    try {
      await api.post('/api/captions/feedback', { caption_id: caption.id, feedback_type: 'copied' })
      updateCaption(caption.id, { wasUsed: true })
    } catch {}
  }

  return (
    <LinearGradient
      colors={['#1e1040', '#130828']}
      style={{
        borderRadius: 20, borderWidth: 1,
        borderColor: caption.wasLiked ? 'rgba(124,58,237,0.5)' : COLORS.border,
        marginBottom: 14, overflow: 'hidden',
      }}
    >
      {/* Top badges */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 16, paddingBottom: 0 }}>
        {[caption.platform, caption.tone, caption.language].map((tag) => (
          <View key={tag} style={{
            backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 100,
            paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
          }}>
            <Text style={{ color: COLORS.secondary, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Caption text */}
      <View style={{ padding: 16 }}>
        <Text style={{ color: COLORS.text, fontSize: 15, lineHeight: 24 }}>
          {caption.finalText ?? caption.generatedText}
        </Text>
      </View>

      {/* Hashtags */}
      {caption.hashtags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 12 }}>
          {caption.hashtags.map((tag) => (
            <Text key={tag} style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>
              {tag.startsWith('#') ? tag : `#${tag}`}
            </Text>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 }} />

      {/* Actions */}
      <View style={{ flexDirection: 'row', padding: 12, gap: 4 }}>
        <TouchableOpacity
          onPress={handleLike}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 6, paddingVertical: 8,
            backgroundColor: caption.wasLiked ? 'rgba(124,58,237,0.15)' : 'transparent',
            borderRadius: 10,
          }}
        >
          <Ionicons
            name={caption.wasLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={caption.wasLiked ? '#ec4899' : COLORS.muted}
          />
          <Text style={{ color: caption.wasLiked ? '#ec4899' : COLORS.muted, fontSize: 13, fontWeight: '600' }}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopy}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', gap: 6, paddingVertical: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name="share-outline" size={18} color={COLORS.muted} />
          <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>Share</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}
