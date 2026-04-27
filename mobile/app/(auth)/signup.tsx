import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthLogo } from '@/components/ui/AuthLogo'
import { COLORS } from '@/constants'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields')
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) Alert.alert('Signup failed', error.message)
    else {
      Alert.alert('Account created!', 'Check your email to verify your account, then sign in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ])
    }
  }

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.authBg, COLORS.dark]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">

          <AuthLogo subtitle="Create your account" />

          <View style={{
            backgroundColor: 'rgba(26, 16, 53, 0.9)', borderRadius: 24,
            borderWidth: 1, borderColor: COLORS.border, padding: 24, gap: 18,
          }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700' }}>Get started free</Text>
            <Input label="Email" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
            <Input label="Password" value={password} onChangeText={setPassword}
              secureTextEntry placeholder="Min. 6 characters" />
            <Button title="Create Account" onPress={handleSignup} loading={loading} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 }}>
            <Text style={{ color: COLORS.muted, fontSize: 15 }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: COLORS.secondary, fontSize: 15, fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
