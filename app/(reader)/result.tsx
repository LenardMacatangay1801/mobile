import { useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const DUMMY_CONSUMERS: Record<string, { name: string; acct: string; meter: string; address: string; prevReading: number }> = {
  'ACC-00142': { name: 'Maria Santos',       acct: 'ACC-00142', meter: 'MTR-7821', address: 'Blk 4 Lot 12, Banaba West, San Mateo, Rizal', prevReading: 1240 },
  'ACC-00087': { name: 'Jose Reyes',         acct: 'ACC-00087', meter: 'MTR-4453', address: 'Blk 2 Lot 6, Banaba West, San Mateo, Rizal',  prevReading: 880  },
  'ACC-00231': { name: 'Ana Dela Cruz',      acct: 'ACC-00231', meter: 'MTR-9102', address: 'Blk 7 Lot 3, Banaba West, San Mateo, Rizal',  prevReading: 2100 },
  'ACC-00055': { name: 'Roberto Villanueva', acct: 'ACC-00055', meter: 'MTR-3341', address: 'Blk 1 Lot 9, Banaba West, San Mateo, Rizal',  prevReading: 660  },
  'ACC-00198': { name: 'Lourdes Bautista',   acct: 'ACC-00198', meter: 'MTR-6678', address: 'Blk 5 Lot 1, Banaba West, San Mateo, Rizal',  prevReading: 1530 },
}

// Billing rate tiers (per m³)
const RATE_TIERS = [
  { label: 'Basic charge (0–10 m³)',  limit: 10, rate: 0,    fixed: 150 },
  { label: 'Tier 1 (11–20 m³)',       limit: 10, rate: 15.5, fixed: 0   },
  { label: 'Tier 2 (21–30 m³)',       limit: 10, rate: 18.0, fixed: 0   },
  { label: 'Tier 3 (31+ m³)',         limit: Infinity, rate: 22.0, fixed: 0 },
]

function calcBill(usage: number): { tiers: { label: string; m3: number; amount: number }[]; subtotal: number; vat: number; total: number } {
  let remaining = Math.max(usage, 0)
  const tiers: { label: string; m3: number; amount: number }[] = []
  let subtotal = 0

  // Fixed basic charge covers first 10 m³
  const basicM3 = Math.min(remaining, 10)
  tiers.push({ label: 'Basic charge (0–10 m³)', m3: basicM3, amount: 150 })
  subtotal += 150
  remaining -= basicM3

  // Tier 1
  if (remaining > 0) {
    const m3 = Math.min(remaining, 10)
    const amt = m3 * 15.5
    tiers.push({ label: 'Tier 1 (11–20 m³)', m3, amount: amt })
    subtotal += amt
    remaining -= m3
  }

  // Tier 2
  if (remaining > 0) {
    const m3 = Math.min(remaining, 10)
    const amt = m3 * 18.0
    tiers.push({ label: 'Tier 2 (21–30 m³)', m3, amount: amt })
    subtotal += amt
    remaining -= m3
  }

  // Tier 3
  if (remaining > 0) {
    const m3 = remaining
    const amt = m3 * 22.0
    tiers.push({ label: 'Tier 3 (31+ m³)', m3, amount: amt })
    subtotal += amt
  }

  const vat = subtotal * 0.12
  const total = subtotal + vat
  return { tiers, subtotal, vat, total }
}

function ReceiptRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, bold && styles.receiptLabelBold]}>{label}</Text>
      <Text style={[styles.receiptValue, bold && styles.receiptValueBold]}>{value}</Text>
    </View>
  )
}

export default function ResultScreen() {
  const { acct, presentReading, notes } = useLocalSearchParams<{ acct: string; presentReading: string; notes: string }>()
  const consumer = DUMMY_CONSUMERS[acct ?? ''] ?? Object.values(DUMMY_CONSUMERS)[0]
  const curr = parseInt(presentReading ?? '0', 10)
  const usage = curr - consumer.prevReading
  const bill = calcBill(usage)
  const scaleAnim = useRef(new Animated.Value(0.85)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  // Mount animation
  Animated.parallel([
    Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
    Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
  ]).start()

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const refNo = `RDG-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} />
        <View style={styles.successBadge}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={styles.headerTitle}>Reading Submitted</Text>
        <Text style={styles.headerSub}>Ref: {refNo}</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
          {/* Receipt card */}
          <View style={styles.receiptCard}>
            {/* Watermark line */}
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptBrand}>BWRWSAI</Text>
              <Text style={styles.receiptBrandSub}>Billing Receipt</Text>
            </View>
            <View style={styles.divider} />

            {/* Consumer info */}
            <Text style={styles.sectionLabel}>CONSUMER</Text>
            <ReceiptRow label="Name"           value={consumer.name} />
            <ReceiptRow label="Account No."    value={consumer.acct} />
            <ReceiptRow label="Meter Serial"   value={consumer.meter} />
            <ReceiptRow label="Address"        value={consumer.address} />
            <View style={styles.divider} />

            {/* Reading info */}
            <Text style={styles.sectionLabel}>READING</Text>
            <ReceiptRow label="Previous Reading" value={`${consumer.prevReading.toLocaleString()} m³`} />
            <ReceiptRow label="Present Reading"  value={`${curr.toLocaleString()} m³`} />
            <ReceiptRow label="Consumption"      value={`${usage} m³`} bold />
            <View style={styles.divider} />

            {/* Billing breakdown */}
            <Text style={styles.sectionLabel}>BILLING BREAKDOWN</Text>
            {bill.tiers.map((t) => (
              <ReceiptRow key={t.label} label={`${t.label} (${t.m3} m³)`} value={`₱ ${t.amount.toFixed(2)}`} />
            ))}
            <View style={styles.divider} />

            <ReceiptRow label="Subtotal"    value={`₱ ${bill.subtotal.toFixed(2)}`} />
            <ReceiptRow label="VAT (12%)"   value={`₱ ${bill.vat.toFixed(2)}`} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
              <Text style={styles.totalValue}>₱ {bill.total.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Notes */}
            {notes ? (
              <>
                <Text style={styles.sectionLabel}>NOTES</Text>
                <Text style={styles.notesText}>{notes}</Text>
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <Text style={styles.footerText}>Date: {dateStr}  {timeStr}</Text>
              <Text style={styles.footerText}>Ref: {refNo}</Text>
              <Text style={styles.footerBrand}>BANABA WEST RURAL WATERWORKS SYSTEM</Text>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.88}
          onPress={() => router.replace('/(reader)/home')}
        >
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanNextBtn}
          activeOpacity={0.88}
          onPress={() => router.replace('/(reader)/scanner')}
        >
          <Text style={styles.scanNextText}>⬡  Scan Next Consumer</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.success,
    paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20,
    alignItems: 'center', overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)',
    top: -60, right: -40,
  },
  successBadge: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  successIcon: { fontSize: 26, color: Colors.white, fontWeight: '900' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  body: { flex: 1, padding: 16 },
  receiptCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.lg,
  },
  receiptHeader: { alignItems: 'center', marginBottom: 14 },
  receiptBrand: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary, letterSpacing: 2 },
  receiptBrandSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12, borderStyle: 'dashed' },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 },
  receiptLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  receiptLabelBold: { fontWeight: '700', color: Colors.textPrimary },
  receiptValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1 },
  receiptValueBold: { fontWeight: '900', color: Colors.primary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#e8f0fe', borderRadius: Radius.sm, padding: 14, marginTop: 6,
  },
  totalLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },
  notesText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  receiptFooter: { alignItems: 'center', gap: 4, paddingTop: 4 },
  footerText: { fontSize: FontSize.xs, color: Colors.textMuted },
  footerBrand: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  doneBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...Shadow.md,
  },
  doneBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  scanNextBtn: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  scanNextText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
})
