import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COLORS } from '@/constants'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Login failed', error.message)
    else router.replace('/(tabs)')
  }

  return (
    <LinearGradient colors={['#0f0a1e', '#1a0535', '#0f0a1e']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <LinearGradient colors={['#7c3aed', '#a855f7']}
              style={{ width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="sparkles" size={36} color="#fff" />
            </LinearGradient>
            <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
              SocialCraft AI
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 15, marginTop: 6 }}>
              Your AI caption companion
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: 'rgba(26, 16, 53, 0.9)', borderRadius: 24,
            borderWidth: 1, borderColor: COLORS.border, padding: 24, gap: 18,
          }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700' }}>Welcome back</Text>

            <Input label="Email" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />

            <View style={{ gap: 6 }}>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
                PASSWORD
              </Text>
              <View style={{ position: 'relative' }}>
                <Input value={password} onChangeText={setPassword}
                  secureTextEntry={!showPass} placeholder="••••••••"
                  style={{ paddingRight: 48 }} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: 14 }}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Sign In" onPress={handleLogin} loading={loading} />
          </View>

          {/* Sign up link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 }}>
            <Text style={{ color: COLORS.muted, fontSize: 15 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={{ color: COLORS.secondary, fontSize: 15, fontWeight: '700' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
