import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const STATS = [
  { label: 'Assigned',  value: '48',  sub: 'consumers',   color: Colors.primary,  bg: '#e8f0fe' },
  { label: 'Done Today', value: '12', sub: 'readings',    color: Colors.success,  bg: '#e6faf3' },
  { label: 'Pending',   value: '36',  sub: 'remaining',   color: Colors.warning,  bg: '#fef9ec' },
  { label: 'This Month', value: '89', sub: 'total reads', color: Colors.accent,   bg: '#e6fdfb' },
]

const RECENT = [
  { name: 'Maria Santos',      acct: 'ACC-00142', prev: 1240, curr: 1318, status: 'done'    },
  { name: 'Jose Reyes',        acct: 'ACC-00087', prev: 880,  curr: 952,  status: 'done'    },
  { name: 'Ana Dela Cruz',     acct: 'ACC-00231', prev: 2100, curr: 2185, status: 'done'    },
  { name: 'Roberto Villanueva',acct: 'ACC-00055', prev: 660,  curr: 0,    status: 'pending' },
  { name: 'Lourdes Bautista',  acct: 'ACC-00198', prev: 1530, curr: 0,    status: 'pending' },
]

export default function HomeScreen() {
  const { userName, logout } = useAuth()
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlobA} />
        <View style={styles.headerBlobB} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.userName}>{userName ?? 'Meter Reader'}</Text>
            <Text style={styles.dateText}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.avatarWrap} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.avatarInitial}>{(userName ?? 'M')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressPct}>25%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressSub}>12 of 48 readings completed</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(reader)/scanner')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>⬡</Text>
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.push('/(reader)/history')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>☰</Text>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
            activeOpacity={0.85}
            onPress={() => router.push('/(reader)/export-report')}
          >
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionLabel}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions description */}
        <View style={styles.actionDescCard}>
          <Text style={styles.actionDescText}>
            <Text style={styles.actionDescBold}>Scan QR</Text> — scan a consumer QR code to begin a reading session.{'  '}
            <Text style={styles.actionDescBold}>History</Text> — review all submitted readings for the current billing cycle.{'  '}
            <Text style={styles.actionDescBold}>Export</Text> — generate and download your monthly reading summary report.
          </Text>
        </View>

        {/* Recent readings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>
          <TouchableOpacity onPress={() => router.push('/(reader)/history')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {RECENT.map((item) => (
          <View key={item.acct} style={styles.readingCard}>
            <View style={[styles.readingAvatar, { backgroundColor: item.status === 'done' ? '#e6faf3' : '#fef9ec' }]}>
              <Text style={{ fontSize: 18 }}>{item.status === 'done' ? '✓' : '…'}</Text>
            </View>
            <View style={styles.readingInfo}>
              <Text style={styles.readingName}>{item.name}</Text>
              <Text style={styles.readingAcct}>{item.acct}</Text>
              {item.status === 'done' && (
                <Text style={styles.readingUsage}>
                  Usage: {item.curr - item.prev} m³  ({item.prev} → {item.curr})
                </Text>
              )}
            </View>
            <View style={[styles.readingBadge, item.status === 'done' ? styles.badgeDone : styles.badgePending]}>
              <Text style={[styles.badgeText, item.status === 'done' ? styles.badgeDoneText : styles.badgePendingText]}>
                {item.status === 'done' ? 'Done' : 'Pending'}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerBlobA: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60, right: -40,
  },
  headerBlobB: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 999, backgroundColor: 'rgba(6,200,180,0.18)',
    bottom: -30, left: 40,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  dateText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitial: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  progressPct: { fontSize: FontSize.sm, color: Colors.white, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 99 },
  progressSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '47%', borderRadius: Radius.md, padding: 14,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: FontSize.xxxl, fontWeight: '900', lineHeight: 38 },
  statLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  statSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: Radius.md, gap: 6, ...Shadow.sm,
  },
  actionIcon: { fontSize: 22, color: Colors.white },
  actionLabel: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },
  actionDescCard: {
    backgroundColor: '#e8f0fe', borderRadius: Radius.md,
    padding: 14, marginTop: -14, marginBottom: 24,
    borderWidth: 1, borderColor: '#c7d9fb',
  },
  actionDescText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  actionDescBold: { fontWeight: '800', color: Colors.primary },
  readingCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 14, marginBottom: 10, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  readingAvatar: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  readingInfo: { flex: 1 },
  readingName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  readingAcct: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  readingUsage: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  readingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeDone: { backgroundColor: '#e6faf3' },
  badgePending: { backgroundColor: '#fef9ec' },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  badgeDoneText: { color: Colors.success },
  badgePendingText: { color: Colors.warning },
})
