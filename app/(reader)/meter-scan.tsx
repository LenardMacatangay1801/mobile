import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const DUMMY_CONSUMERS: Record<string, { name: string; acct: string; meter: string; address: string; prevReading: number }> = {
  'ACC-00142': { name: 'Maria Santos',       acct: 'ACC-00142', meter: 'MTR-7821', address: 'Blk 4 Lot 12, Banaba West, San Mateo, Rizal', prevReading: 1240 },
  'ACC-00087': { name: 'Jose Reyes',         acct: 'ACC-00087', meter: 'MTR-4453', address: 'Blk 2 Lot 6, Banaba West, San Mateo, Rizal',  prevReading: 880  },
  'ACC-00231': { name: 'Ana Dela Cruz',      acct: 'ACC-00231', meter: 'MTR-9102', address: 'Blk 7 Lot 3, Banaba West, San Mateo, Rizal',  prevReading: 2100 },
  'ACC-00055': { name: 'Roberto Villanueva', acct: 'ACC-00055', meter: 'MTR-3341', address: 'Blk 1 Lot 9, Banaba West, San Mateo, Rizal',  prevReading: 660  },
  'ACC-00198': { name: 'Lourdes Bautista',   acct: 'ACC-00198', meter: 'MTR-6678', address: 'Blk 5 Lot 1, Banaba West, San Mateo, Rizal',  prevReading: 1530 },
}

type CaptureState = 'idle' | 'capturing' | 'captured'

export default function MeterScanScreen() {
  const { acct } = useLocalSearchParams<{ acct: string }>()
  const consumer = DUMMY_CONSUMERS[acct ?? ''] ?? Object.values(DUMMY_CONSUMERS)[0]

  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [presentReading, setPresentReading] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const flashAnim = useRef(new Animated.Value(0)).current

  function handleCapture() {
    setCaptureState('capturing')
    // Simulate OCR animation
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()
    setTimeout(() => {
      // Auto-fill with a plausible reading
      const autoReading = (consumer.prevReading + Math.floor(Math.random() * 40 + 40)).toString()
      setPresentReading(autoReading)
      setCaptureState('captured')
    }, 1200)
  }

  function handleSubmit() {
    const curr = parseInt(presentReading, 10)
    if (!presentReading || isNaN(curr)) {
      setError('Please enter a valid meter reading.')
      return
    }
    if (curr < consumer.prevReading) {
      setError(`Current reading (${curr}) cannot be less than previous reading (${consumer.prevReading}).`)
      return
    }
    setError('')
    router.push({
      pathname: '/(reader)/result',
      params: { acct: consumer.acct, presentReading: curr.toString(), notes },
    })
  }

  const usage = parseInt(presentReading, 10) - consumer.prevReading

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBlob} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meter OCR Scan</Text>
          <Text style={styles.headerSub}>{consumer.name} · {consumer.acct}</Text>
        </View>

        <View style={styles.body}>
          {/* Camera viewfinder */}
          <View style={styles.cameraWrap}>
            <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />

            {/* Corner marks */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Meter mockup */}
            <View style={styles.meterMockup}>
              <View style={styles.meterDisplay}>
                {captureState === 'idle' && (
                  <>
                    <Text style={styles.meterDisplayDigits}>_ _ _ _ _ _</Text>
                    <Text style={styles.meterDisplaySub}>Point camera at meter display</Text>
                  </>
                )}
                {captureState === 'capturing' && (
                  <>
                    <Text style={styles.meterDisplayDigits}>Scanning…</Text>
                    <Text style={styles.meterDisplaySub}>Reading meter display</Text>
                  </>
                )}
                {captureState === 'captured' && (
                  <>
                    <Text style={[styles.meterDisplayDigits, { color: Colors.accent }]}>{presentReading}</Text>
                    <Text style={styles.meterDisplaySub}>OCR reading captured ✓</Text>
                  </>
                )}
              </View>
              <Text style={styles.meterSerial}>{consumer.meter}</Text>
            </View>

            {/* Capture button */}
            <TouchableOpacity
              style={[styles.captureBtn, captureState === 'capturing' && styles.captureBtnActive]}
              onPress={handleCapture}
              activeOpacity={0.85}
              disabled={captureState === 'capturing'}
            >
              <Text style={styles.captureBtnText}>
                {captureState === 'idle' ? '⬡  Capture Reading' : captureState === 'capturing' ? 'Scanning…' : '⟳  Re-capture'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual input override */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Present Reading (m³)</Text>
            <Text style={styles.inputHint}>OCR auto-fills this. You can correct it if needed.</Text>
            <TextInput
              style={[styles.readingInput, error ? styles.readingInputError : null]}
              value={presentReading}
              onChangeText={(v) => { setPresentReading(v); setError('') }}
              keyboardType="numeric"
              placeholder="Enter meter reading"
              placeholderTextColor={Colors.textMuted}
              maxLength={8}
            />
            {/* Usage preview */}
            {presentReading && !isNaN(parseInt(presentReading)) && parseInt(presentReading) >= consumer.prevReading && (
              <View style={styles.usagePreview}>
                <Text style={styles.usagePreviewLabel}>Consumption</Text>
                <Text style={styles.usagePreviewValue}>{usage} m³</Text>
              </View>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Notes */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Meter hard to access, gate locked…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Previous reading info */}
          <View style={styles.prevCard}>
            <Text style={styles.prevLabel}>Previous Reading</Text>
            <Text style={styles.prevValue}>{consumer.prevReading.toLocaleString()} m³</Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.88}>
            <Text style={styles.submitText}>Submit Reading</Text>
            <Text style={styles.submitArrow}>→</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const CORNER_SIZE = 20
const CORNER_THICK = 3

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 180, height: 180, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -30,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  backIcon: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  body: { padding: 16 },
  cameraWrap: {
    backgroundColor: '#0c1016', borderRadius: Radius.lg,
    padding: 16, marginBottom: 16,
    alignItems: 'center', ...Shadow.lg, overflow: 'hidden',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: Colors.accent },
  cornerTL: { top: 12, left: 12, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 4 },
  meterMockup: {
    width: '100%', alignItems: 'center', paddingVertical: 24, gap: 8,
  },
  meterDisplay: {
    backgroundColor: '#1a2233', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2a3850',
    marginBottom: 8, minWidth: 200,
  },
  meterDisplayDigits: {
    fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.accent,
    letterSpacing: 3, fontVariant: ['tabular-nums'],
  },
  meterDisplaySub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  meterSerial: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  captureBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 13, paddingHorizontal: 28, marginTop: 8, ...Shadow.sm,
  },
  captureBtnActive: { backgroundColor: Colors.primaryDark, opacity: 0.85 },
  captureBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  inputCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  inputHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 10 },
  readingInput: {
    height: 52, backgroundColor: Colors.background,
    borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, fontSize: FontSize.xl, fontWeight: '800',
    color: Colors.textPrimary, textAlign: 'center',
  },
  readingInputError: { borderColor: Colors.error },
  usagePreview: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#e6faf3', borderRadius: Radius.sm, padding: 10, marginTop: 10,
  },
  usagePreviewLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.success },
  usagePreviewValue: { fontSize: FontSize.md, fontWeight: '900', color: Colors.success },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 6, fontWeight: '600' },
  notesInput: {
    backgroundColor: Colors.background, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, color: Colors.textPrimary,
    minHeight: 76,
  },
  prevCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  prevLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  prevValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, ...Shadow.md,
  },
  submitText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  submitArrow: { fontSize: 18, color: Colors.white, fontWeight: '700' },
})
