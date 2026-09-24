import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useRoute, statusLabel, blockReasonLabel, type RouteEntry } from '@/context/RouteContext'
import { DashboardHeader } from '@/components/dashboard-header'
import { Colors, Fonts, FontSize, Radius, Shadow } from '@/constants/theme'

function statusStyles(status: RouteEntry['status']) {
  if (status === 'read') {
    return { wrap: styles.badgeRead, text: styles.badgeReadText }
  }
  if (status === 'blocked') {
    return { wrap: styles.badgeBlocked, text: styles.badgeBlockedText }
  }
  return { wrap: styles.badgeUnread, text: styles.badgeUnreadText }
}

export default function HomeScreen() {
  const { route, counts } = useRoute()
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
  const done = counts.read + counts.blocked
  const pct = counts.total === 0 ? 0 : Math.round((done / counts.total) * 100)

  const sorted = [...route].sort((a, b) => {
    const order = { unread: 0, blocked: 1, read: 2 }
    return order[a.status] - order[b.status]
  })

  return (
    <View style={styles.root}>
      <DashboardHeader />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Today's route</Text>
            <Text style={styles.pageSub}>{done} of {counts.total} completed · {counts.unread} unread</Text>
          </View>
          <Text style={styles.dateChip}>{today}</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Route progress</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.infoBg }]}>
              <Feather name="users" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Assigned</Text>
            <Text style={styles.statValue}>{counts.total}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.successBg }]}>
              <Feather name="check" size={16} color={Colors.success} />
            </View>
            <Text style={styles.statLabel}>Read</Text>
            <Text style={styles.statValue}>{counts.read}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.errorBg }]}>
              <Feather name="alert-circle" size={16} color={Colors.error} />
            </View>
            <Text style={styles.statLabel}>Blocked</Text>
            <Text style={styles.statValue}>{counts.blocked}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningBg }]}>
              <Feather name="clock" size={16} color={Colors.warning} />
            </View>
            <Text style={styles.statLabel}>Unread</Text>
            <Text style={styles.statValue}>{counts.unread}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assigned consumers</Text>

        {sorted.map((item) => {
          const badge = statusStyles(item.status)
          return (
            <TouchableOpacity
              key={item.acct}
              style={styles.routeCard}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/(reader)/consumer', params: { acct: item.acct } })}
            >
              <View style={styles.routeLeft}>
                <View style={styles.blockChip}>
                  <Text style={styles.blockChipText}>B{item.block}</Text>
                  <Text style={styles.lotChipText}>L{item.lot}</Text>
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{item.name}</Text>
                  <Text style={styles.routeAcct}>{item.acct} · {item.meter}</Text>
                  {item.status === 'read' && item.presentReading != null && (
                    <Text style={styles.routeMeta}>
                      {item.prevReading} → {item.presentReading} m³ · {item.consumption} m³ used
                    </Text>
                  )}
                  {item.status === 'blocked' && (
                    <Text style={styles.routeMeta}>{blockReasonLabel(item.blockReason)}</Text>
                  )}
                  {item.status === 'unread' && (
                    <Text style={styles.routeMeta}>Prev {item.prevReading.toLocaleString()} m³</Text>
                  )}
                </View>
              </View>
              <View style={[styles.badge, badge.wrap]}>
                <Text style={[styles.badgeText, badge.text]}>{statusLabel(item.status)}</Text>
              </View>
            </TouchableOpacity>
          )
        })}

        <View style={{ height: 96 }} />
      </ScrollView>

      <View style={styles.fabWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(reader)/(tabs)/scanner')}>
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Feather name="maximize" size={16} color={Colors.white} />
            <Text style={styles.fabText}>Scan next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  pageHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  pageTitle: { fontFamily: Fonts.bodyBold, fontSize: 26, color: Colors.textPrimary },
  pageSub: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  dateChip: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.textSlate,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 120,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontFamily: Fonts.bodySemi, fontSize: FontSize.sm, color: Colors.textSecondary },
  progressPct: { fontFamily: Fonts.bodyBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  progressTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 99 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  statLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 12 },
  routeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: Colors.border, gap: 10,
  },
  routeLeft: { flexDirection: 'row', flex: 1, gap: 12, alignItems: 'center' },
  blockChip: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center',
  },
  blockChipText: { fontFamily: Fonts.bodyBold, fontSize: FontSize.xs, color: Colors.primary },
  lotChipText: { fontFamily: Fonts.bodySemi, fontSize: 9, color: Colors.textMuted },
  routeInfo: { flex: 1 },
  routeName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  routeAcct: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  routeMeta: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: FontSize.xs },
  badgeRead: { backgroundColor: Colors.successBg },
  badgeReadText: { color: Colors.success },
  badgeBlocked: { backgroundColor: Colors.errorBg },
  badgeBlockedText: { color: Colors.error },
  badgeUnread: { backgroundColor: Colors.warningBg },
  badgeUnreadText: { color: Colors.warning },
  fabWrap: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  fab: {
    height: 52, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Shadow.md,
  },
  fabText: { fontFamily: Fonts.bodyBold, fontSize: FontSize.md, color: Colors.white },
})
