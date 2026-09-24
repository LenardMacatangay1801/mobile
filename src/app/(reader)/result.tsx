import { useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useRoute, blockReasonLabel } from '@/context/RouteContext'
import { ScreenBar } from '@/components/screen-bar'
import { Colors, Fonts, FontSize, Radius, Shadow } from '@/constants/theme'

function ReceiptRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, bold && styles.receiptLabelBold]}>{label}</Text>
      <Text style={[styles.receiptValue, bold && styles.receiptValueBold]}>{value}</Text>
    </View>
  )
}

export default function ResultScreen() {
  const { acct, mode } = useLocalSearchParams<{ acct: string; mode?: string }>()
  const { getConsumer } = useRoute()
  const consumer = getConsumer(acct ?? '') ?? getConsumer('ACC-00142')!
  const isBlocked = mode === 'blocked' || consumer.status === 'blocked'

  const scaleAnim = useRef(new Animated.Value(0.92)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  Animated.parallel([
    Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
    Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
  ]).start()

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <View style={styles.root}>
      <ScreenBar
        title={isBlocked ? 'Could not read' : 'Reading saved'}
        subtitle={isBlocked ? 'Saved on this phone · office will see the reason' : 'Saved on this phone · ready for next house'}
        onBack={() => router.replace('/(reader)/(tabs)/home')}
      />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptBrand}>BWRWSAI</Text>
              <Text style={styles.receiptBrandSub}>Field reading record</Text>
            </View>
            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>CONSUMER</Text>
            <ReceiptRow label="Name" value={consumer.name} />
            <ReceiptRow label="Account No." value={consumer.acct} />
            <ReceiptRow label="Meter Serial" value={consumer.meter} />
            <ReceiptRow label="Address" value={consumer.address} />
            <View style={styles.divider} />

            {isBlocked ? (
              <>
                <Text style={styles.sectionLabel}>BLOCKED</Text>
                <ReceiptRow label="Reason" value={blockReasonLabel(consumer.blockReason)} bold />
                <ReceiptRow label="Previous Reading" value={`${consumer.prevReading.toLocaleString()} m³`} />
              </>
            ) : (
              <>
                <Text style={styles.sectionLabel}>READING</Text>
                <ReceiptRow label="Previous Reading" value={`${consumer.prevReading.toLocaleString()} m³`} />
                <ReceiptRow
                  label="Present Reading"
                  value={`${(consumer.presentReading ?? 0).toLocaleString()} m³`}
                />
                <View style={styles.usageBanner}>
                  <Text style={styles.usageLabel}>Consumption</Text>
                  <Text style={styles.usageValue}>{consumer.consumption ?? 0} m³</Text>
                </View>
              </>
            )}

            {consumer.notes ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>NOTES</Text>
                <Text style={styles.notesText}>{consumer.notes}</Text>
              </>
            ) : null}

            <View style={styles.divider} />
            <View style={styles.syncRow}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>Saved on this phone</Text>
            </View>
            <Text style={styles.footerText}>{dateStr} · {timeStr}</Text>
            <Text style={styles.footerBrand}>BANABA WEST · BATANGAS CITY</Text>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.88}
          onPress={() => router.replace('/(reader)/(tabs)/scanner')}
        >
          <Text style={styles.primaryBtnText}>⬡  Scan next consumer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.88}
          onPress={() => router.replace('/(reader)/(tabs)/home')}
        >
          <Text style={styles.secondaryBtnText}>Back to route</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 16 },
  receiptCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.lg,
  },
  receiptHeader: { alignItems: 'center', marginBottom: 14 },
  receiptBrand: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.textPrimary, letterSpacing: 2 },
  receiptBrandSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 },
  receiptLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  receiptLabelBold: { fontWeight: '700', color: Colors.textPrimary },
  receiptValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', textAlign: 'right', flex: 1 },
  receiptValueBold: { fontWeight: '900', color: Colors.primary },
  usageBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.successBg, borderRadius: Radius.sm, padding: 14, marginTop: 8,
  },
  usageLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.success },
  usageValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.success },
  notesText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 6 },
  syncDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: Colors.warning },
  syncText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  footerText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  footerBrand: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...Shadow.md,
  },
  primaryBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  secondaryBtn: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
})
