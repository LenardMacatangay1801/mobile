import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useRoute } from '@/context/RouteContext'
import { DashboardHeader } from '@/components/dashboard-header'
import { Colors, Fonts, FontSize, Radius, Shadow } from '@/constants/theme'

const DEMO_ACCT = 'ACC-00142'
const FRAME = 280

type Phase = 'ready' | 'scanning' | 'found'

export default function ScannerScreen() {
  const { getConsumer, route } = useRoute()
  const [phase, setPhase] = useState<Phase>('ready')
  const [manualInput, setManualInput] = useState('')
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null)

  const scanLine = useRef(new Animated.Value(0)).current
  const sheetAnim = useRef(new Animated.Value(0)).current
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const demo = getConsumer(DEMO_ACCT)!

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => {
      loop.stop()
      if (scanTimer.current) clearTimeout(scanTimer.current)
    }
  }, [scanLine])

  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: phase === 'found' ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }, [phase, sheetAnim])

  function handleScan() {
    if (phase === 'scanning') return
    if (scanTimer.current) clearTimeout(scanTimer.current)
    setNotFoundCode(null)
    setPhase('scanning')
    scanTimer.current = setTimeout(() => setPhase('found'), 1500)
  }

  function handleScanAgain() {
    if (scanTimer.current) clearTimeout(scanTimer.current)
    setPhase('ready')
  }

  function handleManualSearch() {
    const key = manualInput.trim().toUpperCase()
    if (!key) return
    if (scanTimer.current) clearTimeout(scanTimer.current)
    setPhase('ready')
    const found = route.find((r) => r.acct === key)
    if (found) {
      setNotFoundCode(null)
      navigateToConsumer(key)
    } else {
      setNotFoundCode(key)
    }
  }

  function navigateToConsumer(acct: string) {
    router.push({ pathname: '/(reader)/consumer', params: { acct } })
  }

  const lineY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [18, FRAME - 28],
  })

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <DashboardHeader />

        <View style={styles.body}>
          <View style={styles.pageHead}>
            <Text style={styles.pageTitle}>QR Scanner</Text>
            <Text style={styles.pageSub}>Align the consumer QR code, or enter the account number</Text>
          </View>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Animated.View style={[styles.scanLine, { transform: [{ translateY: lineY }] }]} />

            <View style={styles.demoChip}>
              <Text style={styles.demoChipText}>DEMO</Text>
            </View>

            <View style={styles.frameHint}>
              <Text style={styles.qrMark}>⬡</Text>
              <Text style={styles.frameHintText}>
                {phase === 'scanning' ? 'Reading QR code' : 'Place the code inside the frame'}
              </Text>
            </View>

            {phase === 'scanning' && (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator color={Colors.accent} />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.shutter, phase === 'scanning' && styles.shutterBusy]}
            onPress={phase === 'found' ? handleScanAgain : handleScan}
            activeOpacity={0.85}
            disabled={phase === 'scanning'}
          >
            <View style={styles.shutterRing}>
              <View style={[styles.shutterCore, phase === 'found' && styles.shutterCoreDone]} />
            </View>
            <Text style={styles.shutterLabel}>
              {phase === 'scanning' ? 'Scanning…' : phase === 'found' ? 'Scan again' : 'Scan QR'}
            </Text>
          </TouchableOpacity>

          {phase === 'found' && (
            <Animated.View
              style={[
                styles.resultSheet,
                {
                  opacity: sheetAnim,
                  transform: [{
                    translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
                  }],
                },
              ]}
            >
              <View style={styles.resultHead}>
                <View style={styles.resultCheck}>
                  <Text style={styles.resultCheckText}>✓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultKicker}>QR matched</Text>
                  <Text style={styles.resultName}>{demo.name}</Text>
                </View>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Account</Text>
                <Text style={styles.resultValue}>{demo.acct}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Meter</Text>
                <Text style={styles.resultValue}>{demo.meter}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Address</Text>
                <Text style={[styles.resultValue, styles.resultAddress]}>{demo.address}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Previous</Text>
                <Text style={styles.resultValue}>{demo.prevReading.toLocaleString()} m³</Text>
              </View>
              <TouchableOpacity
                style={styles.continueBtn}
                activeOpacity={0.88}
                onPress={() => navigateToConsumer(demo.acct)}
              >
                <Text style={styles.continueText}>Continue</Text>
                <Text style={styles.continueArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualCard}>
            <Text style={styles.manualLabel}>Account Number</Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. ACC-00142"
                placeholderTextColor={Colors.textMuted}
                value={manualInput}
                onChangeText={setManualInput}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleManualSearch}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleManualSearch} activeOpacity={0.85}>
                <Text style={styles.searchBtnText}>Find</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.manualHint}>Try: ACC-00142, ACC-00087, ACC-00231</Text>
          </View>

          {notFoundCode ? (
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundIcon}>⚠</Text>
              <Text style={styles.notFoundTitle}>Consumer not found</Text>
              <Text style={styles.notFoundSub}>No record for "{notFoundCode}". Check the account number and try again.</Text>
              <TouchableOpacity onPress={() => { setNotFoundCode(null); setManualInput('') }}>
                <Text style={styles.notFoundReset}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const CORNER_SIZE = 22
const CORNER_THICK = 3

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { padding: 20 },
  pageHead: { marginBottom: 16 },
  pageTitle: { fontFamily: Fonts.bodyBold, fontSize: 26, color: Colors.textPrimary },
  pageSub: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  viewfinder: {
    height: FRAME,
    backgroundColor: '#0c1016',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.accent, zIndex: 2,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 4 },
  cornerTR: { top: 14, right: 14, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 4 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute', left: 28, right: 28, top: 0, height: 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 2,
  },
  demoChip: {
    position: 'absolute', top: 14, alignSelf: 'center',
    backgroundColor: 'rgba(6,200,180,0.18)',
    borderWidth: 1, borderColor: 'rgba(6,200,180,0.45)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full, zIndex: 3,
  },
  demoChipText: {
    fontSize: 10, fontWeight: '800', color: Colors.accent, letterSpacing: 1.4,
  },
  frameHint: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24,
  },
  qrMark: { fontSize: 42, color: 'rgba(6,200,180,0.55)' },
  frameHintText: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', fontWeight: '600', textAlign: 'center',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12,16,22,0.35)',
    alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 22,
  },
  shutter: { alignItems: 'center', marginTop: 18, marginBottom: 8, gap: 8 },
  shutterBusy: { opacity: 0.7 },
  shutterRing: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 4, borderColor: Colors.white,
    backgroundColor: '#1a2233',
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  shutterCore: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
  },
  shutterCoreDone: { backgroundColor: Colors.accent },
  shutterLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  resultSheet: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  resultCheck: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.successBg, alignItems: 'center', justifyContent: 'center',
  },
  resultCheckText: { fontSize: 16, fontWeight: '900', color: Colors.success },
  resultKicker: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success, letterSpacing: 0.4 },
  resultName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 12,
    paddingVertical: 7, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  resultLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700' },
  resultValue: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'right' },
  resultAddress: { fontWeight: '600' },
  continueBtn: {
    marginTop: 14, height: 48, borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  continueText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  continueArrow: { fontSize: 16, color: Colors.white, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  manualCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  manualLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 },
  manualRow: { flexDirection: 'row', gap: 10 },
  manualInput: {
    flex: 1, height: 48, backgroundColor: Colors.background,
    borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: FontSize.md, color: Colors.textPrimary,
  },
  searchBtn: {
    height: 48, paddingHorizontal: 20,
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  searchBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  manualHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 8 },
  notFoundCard: {
    marginTop: 16, backgroundColor: Colors.errorBg,
    borderRadius: Radius.md, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(163,45,45,0.2)',
  },
  notFoundIcon: { fontSize: 28, marginBottom: 8 },
  notFoundTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.error, marginBottom: 4 },
  notFoundSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  notFoundReset: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
})
