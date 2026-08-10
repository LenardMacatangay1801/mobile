import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, ActivityIndicator,
  Dimensions,
} from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'
import { Feather } from '@expo/vector-icons'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const shakeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start()
  }

  function triggerButtonPress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80,  useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start()
  }

  // ── FIREBASE LOGIC UNTOUCHED ──────────────────────────────────────────────
  async function handleLogin() {
    triggerButtonPress()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      triggerShake()
      return
    }

    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const userDoc    = await getDoc(doc(db, 'users', credential.user.uid))

      if (!userDoc.exists()) {
        setError('Account not found. Contact your administrator.')
        triggerShake()
        setLoading(false)
        return
      }

      const role = userDoc.data().role

      if (role !== 'meter-reader') {
        setError('This app is for Meter Readers only.')
        triggerShake()
        setLoading(false)
        return
      }

      const { router } = await import('expo-router')
      router.replace('/(reader)/home')

    } catch (err: any) {
      let msg = 'Something went wrong. Please try again.'
      if (
        err.code === 'auth/user-not-found'     ||
        err.code === 'auth/wrong-password'     ||
        err.code === 'auth/invalid-credential'
      ) msg = 'Incorrect email or password.'
      else if (err.code === 'auth/invalid-email')
        msg = 'Invalid email address format.'
      else if (err.code === 'auth/too-many-requests')
        msg = 'Too many attempts. Please wait and try again.'
      else if (err.code === 'auth/network-request-failed')
        msg = 'No internet connection.'

      setError(msg)
      triggerShake()
      setLoading(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>

      {/* ── DARK TOP PANEL (mirrors web left panel) ── */}
      <View style={styles.topPanel}>
        {/* Animated blobs — same 3 as web */}
        <View style={[styles.blob, { width: 320, height: 320, backgroundColor: '#1a6bfa', top: -120, left: -100 }]} />
        <View style={[styles.blob, { width: 240, height: 240, backgroundColor: '#06c8b4', bottom: -60, right: -60 }]} />
        <View style={[styles.blob, { width: 160, height: 160, backgroundColor: '#1a6bfa', top: '40%', right: '5%' }]} />

        {/* Pulsing rings */}
        <View style={styles.ringsWrap}>
          {[140, 200, 270].map((size, i) => (
            <View key={size} style={[styles.ring, { width: size, height: size }]} />
          ))}
        </View>

        {/* Brand block */}
        <View style={styles.brandBlock}>
          {/* Logo icon — matches website SVG water drop */}
          <View style={styles.logoIconWrap}>
            <Feather name="droplet" size={26} color="#ffffff" />
          </View>

          {/* Brand name + subtitle */}
          <Text style={styles.brandName}>BWRWSAI</Text>
          <Text style={styles.brandSub}>Water Billing Management System</Text>
        </View>

        {/* Headline — mirrors web left panel text */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>
            Banaba West{'\n'}
            Rural Waterworks{'\n'}
            <Text style={styles.headlineAccent}>Sanitation Association Inc.</Text>
          </Text>
          <Text style={styles.tagline}>
            Empowering communities with efficient, transparent water management.
          </Text>
        </View>
      </View>

      {/* ── WHITE BOTTOM PANEL (mirrors web right panel) ── */}
      <KeyboardAvoidingView
        style={styles.bottomPanelWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.bottomScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.formSheet, { transform: [{ translateX: shakeAnim }] }]}>

            {/* Form heading */}
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>Enter your staff credentials to continue</Text>

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                {/* Envelope icon */}
                <View style={styles.inputIconWrap}>
                  <View style={styles.envIcon}>
                    <View style={styles.envTop} />
                    <View style={styles.envBottom} />
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="you@bwrwsai.com"
                  placeholderTextColor="#9aaabb"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={[styles.fieldGroup, { marginBottom: 28 }]}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrap}>
                {/* Lock icon */}
                <View style={styles.inputIconWrap}>
                  <View style={styles.lockBody} />
                  <View style={styles.lockShackle} />
                </View>
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#9aaabb"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoComplete="current-password"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPass(p => !p)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showPass ? 'eye-off' : 'eye'}
                    size={18}
                    color="#7a8898"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                activeOpacity={0.88}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Enter Dashboard</Text>
                    <Text style={styles.submitArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Footer note */}
            <Text style={styles.footerNote}>
              Don't have an account? Contact your administrator.
            </Text>
          </Animated.View>

          {/* Copyright */}
          <Text style={styles.copyright}>
            © 2026 BWRWSAI — Banaba West Rural Waterworks System.{'\n'}All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c1016' },

  // ── TOP DARK PANEL ──────────────────────────────────────────
  topPanel: {
    backgroundColor: '#0c1016',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 28,
    overflow: 'hidden',
    minHeight: SCREEN_HEIGHT * 0.42,
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  ringsWrap: {
    position: 'absolute',
    top: '50%', left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  logoIconWrap: {
    width: 56, height: 56,
    borderRadius: 16,
    backgroundColor: '#1a6bfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadow.md,
  },
  logoIconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropShape: {
    width: 20, height: 26,
    borderRadius: 10,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  dropHole: {
    width: 7, height: 7,
    borderRadius: 99,
    backgroundColor: '#1a6bfa',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.4,
  },
  headlineBlock: {
    zIndex: 2,
    alignItems: 'center',
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 10,
  },
  headlineAccent: {
    color: '#06c8b4',
  },
  tagline: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // ── WHITE BOTTOM PANEL ──────────────────────────────────────
  bottomPanelWrap: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    overflow: 'hidden',
  },
  bottomScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  formSheet: {
    width: '100%',
  },
  formTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#0c1016',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: FontSize.sm,
    color: '#7a8898',
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 20,
  },
  errorIcon: { fontSize: 14 },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: '500',
  },
  fieldGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3a4655',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  // Envelope icon pieces
  envIcon: { width: 17, height: 13, position: 'relative' },
  envTop: {
    position: 'absolute',
    width: 17, height: 13,
    borderWidth: 1.5,
    borderColor: '#7a8898',
    borderRadius: 2,
  },
  envBottom: {
    position: 'absolute',
    top: 0, left: 0,
    width: 0, height: 0,
    borderLeftWidth: 8.5,
    borderRightWidth: 8.5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7a8898',
  },
  // Lock icon pieces
  lockBody: {
    width: 14, height: 10,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#7a8898',
    marginTop: 4,
  },
  lockShackle: {
    position: 'absolute',
    top: -1,
    width: 8, height: 7,
    borderTopLeftRadius: 99,
    borderTopRightRadius: 99,
    borderWidth: 1.5,
    borderColor: '#7a8898',
    borderBottomWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: '#0c1016',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  // eye icon handled by Feather vector icon
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 54,
    backgroundColor: '#1a6bfa',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#1a6bfa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 8,
  },
  submitText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  submitArrow: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '700',
  },
  footerNote: {
    fontSize: FontSize.xs,
    color: '#7a8898',
    textAlign: 'center',
  },
  copyright: {
    marginTop: 28,
    fontSize: FontSize.xs,
    color: 'rgba(0,0,0,0.28)',
    textAlign: 'center',
    lineHeight: 18,
  },
})
