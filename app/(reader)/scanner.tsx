import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const DUMMY_CONSUMERS: Record<string, { name: string; acct: string; meter: string; address: string; prevReading: number }> = {
  'ACC-00142': { name: 'Maria Santos',       acct: 'ACC-00142', meter: 'MTR-7821', address: 'Blk 4 Lot 12, Banaba West, San Mateo, Rizal', prevReading: 1240 },
  'ACC-00087': { name: 'Jose Reyes',         acct: 'ACC-00087', meter: 'MTR-4453', address: 'Blk 2 Lot 6, Banaba West, San Mateo, Rizal',  prevReading: 880  },
  'ACC-00231': { name: 'Ana Dela Cruz',      acct: 'ACC-00231', meter: 'MTR-9102', address: 'Blk 7 Lot 3, Banaba West, San Mateo, Rizal',  prevReading: 2100 },
  'ACC-00055': { name: 'Roberto Villanueva', acct: 'ACC-00055', meter: 'MTR-3341', address: 'Blk 1 Lot 9, Banaba West, San Mateo, Rizal',  prevReading: 660  },
  'ACC-00198': { name: 'Lourdes Bautista',   acct: 'ACC-00198', meter: 'MTR-6678', address: 'Blk 5 Lot 1, Banaba West, San Mateo, Rizal',  prevReading: 1530 },
}

type ScanMode = 'viewfinder' | 'result' | 'notfound'

export default function ScannerScreen() {
  const [mode, setMode] = useState<ScanMode>('viewfinder')
  const [manualInput, setManualInput] = useState('')
  const [notFoundCode, setNotFoundCode] = useState('')
  const pulseAnim = useRef(new Animated.Value(1)).current
  const cornerAnim = useRef(new Animated.Value(0)).current

  // Fake scan animation → always finds first dummy consumer
  function handleFakeScan() {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
    ]).start(() => {
      const randomKey = Object.keys(DUMMY_CONSUMERS)[Math.floor(Math.random() * Object.keys(DUMMY_CONSUMERS).length)]
      navigateToConsumer(randomKey)
    })
  }

  function handleManualSearch() {
    const key = manualInput.trim().toUpperCase()
    if (!key) return
    if (DUMMY_CONSUMERS[key]) {
      navigateToConsumer(key)
    } else {
      setNotFoundCode(key)
      setMode('notfound')
    }
  }

  function navigateToConsumer(acct: string) {
    router.push({ pathname: '/(reader)/consumer', params: { acct } })
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBlob} />
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <Text style={styles.headerSub}>Point at consumer QR code or enter account number</Text>
        </View>

        <View style={styles.body}>
          {/* Viewfinder */}
          <TouchableOpacity
            style={styles.viewfinderWrap}
            onPress={handleFakeScan}
            activeOpacity={0.9}
          >
            <Animated.View style={[styles.viewfinder, { transform: [{ scale: pulseAnim }] }]}>
              {/* Corner marks */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Scan line */}
              <View style={styles.scanLine} />

              {/* Center content */}
              <View style={styles.viewfinderCenter}>
                <Text style={styles.qrEmoji}>⬡</Text>
                <Text style={styles.viewfinderHint}>Tap to Simulate Scan</Text>
                <Text style={styles.viewfinderSub}>Camera preview would appear here</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual input */}
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

          {/* Not found state */}
          {mode === 'notfound' && (
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundIcon}>⚠</Text>
              <Text style={styles.notFoundTitle}>Consumer not found</Text>
              <Text style={styles.notFoundSub}>No record for "{notFoundCode}". Check the account number and try again.</Text>
              <TouchableOpacity onPress={() => { setMode('viewfinder'); setManualInput('') }}>
                <Text style={styles.notFoundReset}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const CORNER_SIZE = 22
const CORNER_THICK = 3

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    top: -50, right: -30,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  body: { padding: 20 },
  viewfinderWrap: { alignItems: 'center', marginBottom: 28 },
  viewfinder: {
    width: 260, height: 260,
    backgroundColor: '#0c1016',
    borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.accent,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 4 },
  cornerTR: { top: 14, right: 14, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 4 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute', left: 20, right: 20, top: '50%',
    height: 1.5, backgroundColor: Colors.accent, opacity: 0.6,
  },
  viewfinderCenter: { alignItems: 'center', gap: 8 },
  qrEmoji: { fontSize: 48, color: Colors.accent },
  viewfinderHint: { fontSize: FontSize.sm, color: Colors.white, fontWeight: '700' },
  viewfinderSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  manualCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
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
    marginTop: 16, backgroundColor: '#fff1f2',
    borderRadius: Radius.md, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#fecdd3',
  },
  notFoundIcon: { fontSize: 28, marginBottom: 8 },
  notFoundTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.error, marginBottom: 4 },
  notFoundSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  notFoundReset: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
})
