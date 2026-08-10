import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const DUMMY_CONSUMERS: Record<string, { name: string; acct: string; meter: string; address: string; prevReading: number }> = {
  'ACC-00142': { name: 'Maria Santos',       acct: 'ACC-00142', meter: 'MTR-7821', address: 'Blk 4 Lot 12, Banaba West, San Mateo, Rizal', prevReading: 1240 },
  'ACC-00087': { name: 'Jose Reyes',         acct: 'ACC-00087', meter: 'MTR-4453', address: 'Blk 2 Lot 6, Banaba West, San Mateo, Rizal',  prevReading: 880  },
  'ACC-00231': { name: 'Ana Dela Cruz',      acct: 'ACC-00231', meter: 'MTR-9102', address: 'Blk 7 Lot 3, Banaba West, San Mateo, Rizal',  prevReading: 2100 },
  'ACC-00055': { name: 'Roberto Villanueva', acct: 'ACC-00055', meter: 'MTR-3341', address: 'Blk 1 Lot 9, Banaba West, San Mateo, Rizal',  prevReading: 660  },
  'ACC-00198': { name: 'Lourdes Bautista',   acct: 'ACC-00198', meter: 'MTR-6678', address: 'Blk 5 Lot 1, Banaba West, San Mateo, Rizal',  prevReading: 1530 },
}

type InfoRowProps = { label: string; value: string; icon: string }
function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

export default function ConsumerScreen() {
  const { acct } = useLocalSearchParams<{ acct: string }>()
  const consumer = DUMMY_CONSUMERS[acct ?? ''] ?? Object.values(DUMMY_CONSUMERS)[0]

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consumer Profile</Text>
        <Text style={styles.headerSub}>Review details before proceeding</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{consumer.name[0]}</Text>
          </View>
          <Text style={styles.consumerName}>{consumer.name}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active Account</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <InfoRow icon="#" label="Account Number"    value={consumer.acct}    />
          <InfoRow icon="⌗" label="Meter Serial No."  value={consumer.meter}   />
          <InfoRow icon="⌂" label="Service Address"   value={consumer.address} />
        </View>

        {/* Previous reading card */}
        <View style={[styles.card, styles.readingCard]}>
          <Text style={styles.cardTitle}>Previous Reading</Text>
          <View style={styles.readingDisplay}>
            <Text style={styles.readingNumber}>{consumer.prevReading.toLocaleString()}</Text>
            <Text style={styles.readingUnit}>m³</Text>
          </View>
          <Text style={styles.readingDate}>Last read: {new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        {/* Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ</Text>
          <Text style={styles.noticeText}>
            Verify the meter serial number on-site matches <Text style={{ fontWeight: '700' }}>{consumer.meter}</Text> before proceeding.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.proceedBtn}
          activeOpacity={0.88}
          onPress={() => router.push({ pathname: '/(reader)/meter-scan', params: { acct: consumer.acct } })}
        >
          <Text style={styles.proceedText}>Proceed to Meter Scan</Text>
          <Text style={styles.proceedArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 32,
    paddingHorizontal: 20, overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60, right: -40,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  backIcon: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 24 },
  avatarSection: { alignItems: 'center' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 10,
  },
  avatarLetter: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.white },
  consumerName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  statusDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.accent },
  statusText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '600' },
  body: { flex: 1, padding: 16 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoIcon: { fontSize: 16, color: Colors.primary },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  readingCard: { alignItems: 'center' },
  readingDisplay: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 6 },
  readingNumber: { fontSize: 52, fontWeight: '900', color: Colors.primary, lineHeight: 58 },
  readingUnit: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  readingDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#e8f0fe', borderRadius: Radius.md,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#c7d9fb',
  },
  noticeIcon: { fontSize: 16, color: Colors.primary },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  proceedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, ...Shadow.md,
  },
  proceedText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  proceedArrow: { fontSize: 18, color: Colors.white, fontWeight: '700' },
})
