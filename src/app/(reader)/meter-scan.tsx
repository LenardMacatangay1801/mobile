import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Modal,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useRoute, BLOCK_REASONS, type BlockReason } from '@/context/RouteContext'
import { ScreenBar } from '@/components/screen-bar'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

type CaptureState = 'idle' | 'capturing' | 'captured'

export default function MeterScanScreen() {
  const { acct } = useLocalSearchParams<{ acct: string }>()
  const { getConsumer, saveReading, saveBlocked } = useRoute()
  const consumer = getConsumer(acct ?? '') ?? getConsumer('ACC-00142')!

  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [revealed, setRevealed] = useState('')
  const [presentReading, setPresentReading] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [blockOpen, setBlockOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<BlockReason | null>(null)
  const flashAnim = useRef(new Animated.Value(0)).current
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const demoReading = String(consumer.prevReading + 78)
  const parsed = parseInt(presentReading, 10)
  const usageReady = presentReading !== '' && !isNaN(parsed) && parsed >= consumer.prevReading
  const usage = usageReady ? parsed - consumer.prevReading : null

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function handleCapture() {
    clearTimers()
    setError('')
    setPresentReading('')
    setRevealed('')
    setCaptureState('capturing')

    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start()

    demoReading.split('').forEach((_, index) => {
      const timer = setTimeout(() => {
        const next = demoReading.slice(0, index + 1)
        setRevealed(next)
        if (index === demoReading.length - 1) {
          setPresentReading(next)
          setCaptureState('captured')
        }
      }, 420 + index * 220)
      timers.current.push(timer)
    })
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
    saveReading(consumer.acct, curr, notes.trim())
    router.replace({
      pathname: '/(reader)/result',
      params: { acct: consumer.acct, mode: 'read' },
    })
  }

  function handleConfirmBlocked() {
    if (!selectedReason) return
    saveBlocked(consumer.acct, selectedReason, notes.trim())
    setBlockOpen(false)
    router.replace({
      pathname: '/(reader)/result',
      params: { acct: consumer.acct, mode: 'blocked' },
    })
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ScreenBar
          title="Meter scan"
          subtitle={`${consumer.name} · ${consumer.acct}`}
          onBack={() => router.back()}
        />

        <View style={styles.body}>
          <View style={styles.cameraWrap}>
            <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />

            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={styles.demoChip}>
              <Text style={styles.demoChipText}>DEMO</Text>
            </View>

            <View style={styles.meterMockup}>
              <Text style={styles.aimLabel}>
                {captureState === 'idle'
                  ? 'Frame the meter digits'
                  : captureState === 'capturing'
                    ? 'Reading digits…'
                    : 'Reading detected'}
              </Text>
              <View style={styles.meterDisplay}>
                <View style={styles.digitRow}>
                  {demoReading.split('').map((_, index) => {
                    const shown = index < revealed.length
                    return (
                      <View key={index} style={[styles.digitSlot, shown && styles.digitSlotOn]}>
                        <Text style={[styles.digitChar, shown && styles.digitCharOn]}>
                          {shown ? revealed[index] : ''}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>
              <Text style={styles.meterSerial}>{consumer.meter}</Text>
            </View>

            <TouchableOpacity
              style={[styles.shutter, captureState === 'capturing' && styles.shutterBusy]}
              onPress={handleCapture}
              activeOpacity={0.85}
              disabled={captureState === 'capturing'}
            >
              <View style={styles.shutterRing}>
                <View style={[styles.shutterCore, captureState === 'captured' && styles.shutterCoreDone]} />
              </View>
            </TouchableOpacity>
            <Text style={styles.shutterLabel}>
              {captureState === 'idle' ? 'Capture' : captureState === 'capturing' ? 'Reading…' : 'Re-capture'}
            </Text>
          </View>

          <View style={styles.compareCard}>
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Previous</Text>
              <Text style={styles.compareValue}>{consumer.prevReading.toLocaleString()}</Text>
            </View>
            <Text style={styles.compareArrow}>→</Text>
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Present</Text>
              <Text style={[styles.compareValue, { color: Colors.primary }]}>
                {usageReady ? parsed.toLocaleString() : '—'}
              </Text>
            </View>
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Used</Text>
              <Text style={[styles.compareValue, { color: Colors.success }]}>
                {usage != null ? `${usage}` : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Present Reading (m³)</Text>
            <Text style={styles.inputHint}>The detected reading lands here. Correct it if a digit is wrong.</Text>
            <TextInput
              style={[styles.readingInput, error ? styles.readingInputError : null]}
              value={presentReading}
              onChangeText={(v) => { setPresentReading(v); setError('') }}
              keyboardType="numeric"
              placeholder="Detected reading"
              placeholderTextColor={Colors.textMuted}
              maxLength={8}
              editable={captureState !== 'capturing'}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Extra detail for your supervisor…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.88}>
            <Text style={styles.submitText}>Submit Reading</Text>
            <Text style={styles.submitArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blockBtn}
            onPress={() => setBlockOpen(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.blockBtnText}>Could not read</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      <Modal visible={blockOpen} transparent animationType="fade" onRequestClose={() => setBlockOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Could not read</Text>
            <Text style={styles.modalSub}>Pick the reason so the office sees it today.</Text>

            {BLOCK_REASONS.map((reason) => {
              const active = selectedReason === reason.id
              return (
                <TouchableOpacity
                  key={reason.id}
                  style={[styles.reasonRow, active && styles.reasonRowActive]}
                  onPress={() => setSelectedReason(reason.id)}
                  activeOpacity={0.85}
                >
                  <View>
                    <Text style={[styles.reasonLabel, active && styles.reasonLabelActive]}>{reason.label}</Text>
                    <Text style={styles.reasonTagalog}>{reason.tagalog}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]} />
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              style={[styles.modalConfirm, !selectedReason && styles.modalConfirmDisabled]}
              disabled={!selectedReason}
              onPress={handleConfirmBlocked}
              activeOpacity={0.88}
            >
              <Text style={styles.modalConfirmText}>Save as blocked</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setBlockOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const CORNER_SIZE = 20
const CORNER_THICK = 3

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 16 },
  cameraWrap: {
    backgroundColor: '#0c1016', borderRadius: Radius.lg,
    padding: 16, marginBottom: 16,
    alignItems: 'center', ...Shadow.lg, overflow: 'hidden',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: Colors.accent },
  cornerTL: { top: 12, left: 12, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 4 },
  meterMockup: {
    width: '100%', alignItems: 'center', paddingVertical: 16, gap: 8,
  },
  meterDisplay: {
    backgroundColor: '#1a2233', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2a3850',
    marginBottom: 8,
  },
  meterSerial: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  demoChip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(6,200,180,0.18)',
    borderWidth: 1, borderColor: 'rgba(6,200,180,0.45)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full, marginBottom: 8,
  },
  demoChipText: { fontSize: 10, fontWeight: '800', color: Colors.accent, letterSpacing: 1.4 },
  aimLabel: { fontSize: FontSize.sm, fontWeight: '700', color: 'rgba(255,255,255,0.72)', marginBottom: 10 },
  digitRow: { flexDirection: 'row', gap: 8 },
  digitSlot: {
    width: 36, height: 52, borderRadius: 8,
    backgroundColor: '#121826',
    borderWidth: 1, borderColor: '#2a3850',
    alignItems: 'center', justifyContent: 'center',
  },
  digitSlotOn: { borderColor: Colors.accent, backgroundColor: '#10241f' },
  digitChar: { fontSize: 26, fontWeight: '900', color: 'transparent' },
  digitCharOn: { color: Colors.accent },
  shutter: { alignItems: 'center', marginTop: 6 },
  shutterBusy: { opacity: 0.7 },
  shutterRing: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 4, borderColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  shutterCore: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primary },
  shutterCoreDone: { backgroundColor: Colors.accent },
  shutterLabel: { marginTop: 8, fontSize: FontSize.sm, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  compareCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.md, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  compareCol: { flex: 1, alignItems: 'center' },
  compareLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', marginBottom: 4 },
  compareValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.textPrimary },
  compareArrow: { fontSize: 18, color: Colors.textMuted, fontWeight: '700', marginHorizontal: 4 },
  inputCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
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
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 6, fontWeight: '600' },
  notesInput: {
    backgroundColor: Colors.background, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, color: Colors.textPrimary,
    minHeight: 76,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, ...Shadow.md, marginBottom: 10,
  },
  submitText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  submitArrow: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  blockBtn: {
    height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.error,
  },
  blockBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.error },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(12,16,22,0.55)',
    justifyContent: 'flex-end', padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 20,
    ...Shadow.lg,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: 16 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 8,
  },
  reasonRowActive: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
  reasonLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  reasonLabelActive: { color: Colors.primary },
  reasonTagalog: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  radio: {
    width: 18, height: 18, borderRadius: 99,
    borderWidth: 2, borderColor: Colors.border,
  },
  radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  modalConfirm: {
    marginTop: 8, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
  },
  modalConfirmDisabled: { opacity: 0.45 },
  modalConfirmText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.white },
  modalCancel: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  modalCancelText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
})
