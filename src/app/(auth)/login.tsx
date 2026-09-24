import { useRef, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { fetchUserProfile, isMeterReader, supabase } from '@/services/supabase'
import { useAuth } from '@/context/AuthContext'
import { WaterScene } from '@/components/water-scene'
import { BrandLockup } from '@/components/brand-lockup'
import { Colors, Fonts, FontSize, Radius } from '@/constants/theme'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function LoginScreen() {
  const { beginSignIn, endSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const shakeAnim = useRef(new Animated.Value(0)).current

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  async function handleLogin() {
    setError('')
    setNotice('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      triggerShake()
      return
    }

    setLoading(true)
    beginSignIn()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError || !data.user) {
        throw signInError ?? new Error('Sign-in failed.')
      }

      const { profile, hasRow } = await fetchUserProfile(data.user.id)

      if (!hasRow) {
        await supabase.auth.signOut()
        setError('Account not found. Contact your administrator.')
        triggerShake()
        endSignIn()
        return
      }

      if (!isMeterReader(profile.role)) {
        await supabase.auth.signOut()
        setError('This app is for Meter Readers only.')
        triggerShake()
        endSignIn()
        return
      }

      await wait(1100)
      const { router } = await import('expo-router')
      router.replace('/(reader)/(tabs)/home')
      await wait(620)
      endSignIn()
    } catch (err: any) {
      const code = err?.code ?? ''
      const message = String(err?.message ?? '').toLowerCase()
      let msg = 'Something went wrong. Please try again.'
      if (
        code === 'invalid_credentials' ||
        code === 'invalid_login_credentials' ||
        message.includes('invalid login credentials')
      ) msg = 'Incorrect email or password.'
      else if (code === 'email_not_confirmed')
        msg = 'Please confirm your email before signing in.'
      else if (code === 'validation_failed' || message.includes('invalid email'))
        msg = 'Invalid email address format.'
      else if (code === 'over_request_rate_limit' || code === 'too_many_requests')
        msg = 'Too many attempts. Please wait and try again.'
      else if (message.includes('network') || message.includes('fetch'))
        msg = 'No internet connection.'

      setError(msg)
      triggerShake()
      endSignIn()
    } finally {
      setLoading(false)
    }
  }

  return (
    <WaterScene bubblesOnly>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <BrandLockup />
          </View>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.cardSheen} />
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.headingSub}>Sign in to manage billing, readings, and accounts.</Text>

            {error ? (
              <View style={styles.banner}>
                <Feather name="alert-circle" size={14} color="#ffb4b4" />
                <Text style={styles.bannerText}>{error}</Text>
              </View>
            ) : null}
            {notice ? (
              <View style={styles.notice}>
                <Feather name="info" size={14} color={Colors.accent} />
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color="rgba(234,246,248,0.45)" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(234,246,248,0.32)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color="rgba(234,246,248,0.45)" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(234,246,248,0.32)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoComplete="current-password"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} hitSlop={8}>
                <Feather
                  name={showPass ? 'eye-off' : 'eye'}
                  size={16}
                  color="rgba(234,246,248,0.45)"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.remember}
                onPress={() => setRememberMe((v) => !v)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                  {rememberMe ? <Feather name="check" size={11} color={Colors.deep} /> : null}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setError('')
                  setNotice('Please contact your administrator to reset your password.')
                }}
              >
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.submit, loading && { opacity: 0.75 }]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Feather name="log-in" size={16} color={Colors.white} />
                    <Text style={styles.submitText}>Enter Dashboard</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.note}>Don't have an account? Contact your administrator.</Text>
          </Animated.View>

          <Text style={styles.footer}>
            © 2026 BWRWSAI — Banaba West Rural Waterworks System. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </WaterScene>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  brand: { alignItems: 'center', marginBottom: 26 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.xl,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.white,
    textAlign: 'center',
  },
  headingSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(234,246,248,0.55)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 18,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(163,45,45,0.28)',
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,180,180,0.25)',
  },
  bannerText: { flex: 1, color: '#ffd6d6', fontFamily: Fonts.bodyMedium, fontSize: FontSize.sm },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6,200,180,0.12)',
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(6,200,180,0.28)',
  },
  noticeText: { flex: 1, color: Colors.foam, fontFamily: Fonts.bodyMedium, fontSize: FontSize.sm },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(234,246,248,0.6)',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(7,26,43,0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    height: '100%',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(234,246,248,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rememberText: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: 'rgba(234,246,248,0.6)' },
  forgot: { fontFamily: Fonts.bodySemi, fontSize: FontSize.sm, color: Colors.accent },
  submit: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.white },
  note: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: 'rgba(234,246,248,0.4)',
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(234,246,248,0.32)',
  },
})
