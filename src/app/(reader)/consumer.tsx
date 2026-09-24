import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useRoute, statusLabel } from '@/context/RouteContext'
import { ScreenBar } from '@/components/screen-bar'
import { Colors, Fonts, FontSize, Radius, Shadow } from '@/constants/theme'

type InfoRowProps = { label: string; value: string; emphasize?: boolean }
function InfoRow({ label, value, emphasize }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, emphasize && styles.infoValueBig]}>{value}</Text>
    </View>
  )
}

export default function ConsumerScreen() {
  const { acct } = useLocalSearchParams<{ acct: string }>()
  const { getConsumer } = useRoute()
  const consumer = getConsumer(acct ?? '') ?? getConsumer('ACC-00142')!

  return (
    <View style={styles.root}>
      <ScreenBar
        title={consumer.name}
        subtitle="Confirm the meter before you capture"
        onBack={() => router.back()}
      />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              consumer.status === 'read' && { backgroundColor: Colors.success },
              consumer.status === 'blocked' && { backgroundColor: Colors.error },
              consumer.status === 'unread' && { backgroundColor: Colors.warning },
            ]} />
            <Text style={styles.statusText}>{statusLabel(consumer.status)}</Text>
          </View>
          <Text style={styles.heroKicker}>At the gate</Text>
          <Text style={styles.heroBlock}>Blk {consumer.block} Lot {consumer.lot}</Text>
          <Text style={styles.heroMeter}>{consumer.meter}</Text>
          <Text style={styles.heroPrev}>Previous {consumer.prevReading.toLocaleString()} m³</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <InfoRow label="Account Number" value={consumer.acct} />
          <InfoRow label="Service Address" value={consumer.address} />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ</Text>
          <Text style={styles.noticeText}>
            Verify the meter serial on-site matches <Text style={{ fontWeight: '700' }}>{consumer.meter}</Text> before proceeding.
          </Text>
        </View>

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
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.infoBg,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  statusDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.accent },
  statusText: { fontFamily: Fonts.bodySemi, fontSize: FontSize.xs, color: Colors.textPrimary },
  body: { flex: 1, padding: 16 },
  heroCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 20, marginBottom: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.md,
  },
  heroKicker: {
    fontFamily: Fonts.bodySemi,
    fontSize: FontSize.xs, color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  heroBlock: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.textPrimary },
  heroMeter: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.primary, marginTop: 6, letterSpacing: 1 },
  heroPrev: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 8, fontWeight: '600' },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  cardTitle: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary,
    marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  infoValueBig: { fontSize: FontSize.lg },
  noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.infoBg, borderRadius: Radius.md,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(26,107,250,0.16)',
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
