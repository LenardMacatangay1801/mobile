import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useRoute, statusLabel, blockReasonLabel } from '@/context/RouteContext'
import { DashboardHeader } from '@/components/dashboard-header'
import { Colors, Fonts, FontSize, Radius } from '@/constants/theme'

export default function HistoryScreen() {
  const { route } = useRoute()
  const [search, setSearch] = useState('')

  const completed = route
    .filter((r) => r.status === 'read' || r.status === 'blocked')
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.acct.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))

  return (
    <View style={styles.root}>
      <DashboardHeader />

      <View style={styles.pageHead}>
        <Text style={styles.pageTitle}>Reading History</Text>
        <Text style={styles.pageSub}>{completed.length} saved on this phone</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or account…"
          placeholderTextColor={Colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {completed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☰</Text>
            <Text style={styles.emptyText}>No readings yet</Text>
            <Text style={styles.emptySub}>Submit a reading or mark a meter as blocked to see it here.</Text>
          </View>
        ) : (
          completed.map((r) => {
            const isBlocked = r.status === 'blocked'
            return (
              <View key={r.acct} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyAvatar, isBlocked && styles.historyAvatarBlocked]}>
                    <Text style={[styles.historyAvatarText, isBlocked && { color: Colors.error }]}>
                      {r.name[0]}
                    </Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{r.name}</Text>
                    <Text style={styles.historyAcct}>{r.acct}</Text>
                    {isBlocked ? (
                      <Text style={styles.historyReading}>{blockReasonLabel(r.blockReason)}</Text>
                    ) : (
                      <Text style={styles.historyReading}>
                        {r.prevReading} → {r.presentReading} m³ · {r.consumption} m³ used
                      </Text>
                    )}
                    {r.notes ? <Text style={styles.historyNotes}>{r.notes}</Text> : null}
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <View style={[styles.doneBadge, isBlocked && styles.blockedBadge]}>
                    <Text style={[styles.doneBadgeText, isBlocked && styles.blockedBadgeText]}>
                      {statusLabel(r.status)}
                    </Text>
                  </View>
                  <Text style={styles.syncHint}>On phone</Text>
                </View>
              </View>
            )
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  pageHead: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4 },
  pageTitle: { fontFamily: Fonts.bodyBold, fontSize: 26, color: Colors.textPrimary },
  pageSub: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, marginHorizontal: 16, marginTop: 12, marginBottom: 14,
    borderRadius: Radius.md, paddingHorizontal: 14, height: 46,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 18, color: Colors.textMuted, marginRight: 8 },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textPrimary },
  clearIcon: { fontSize: 14, color: Colors.textMuted, padding: 4 },
  body: { flex: 1, paddingHorizontal: 14 },
  historyCard: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  historyLeft: { flexDirection: 'row', flex: 1, gap: 10 },
  historyAvatar: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center',
  },
  historyAvatarBlocked: { backgroundColor: Colors.errorBg },
  historyAvatarText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  historyInfo: { flex: 1 },
  historyName: { fontFamily: Fonts.bodyBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  historyAcct: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  historyReading: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
  historyNotes: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  doneBadge: { backgroundColor: Colors.successBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  doneBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success },
  blockedBadge: { backgroundColor: Colors.errorBg },
  blockedBadgeText: { color: Colors.error },
  syncHint: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 36, color: Colors.textMuted },
  emptyText: { fontFamily: Fonts.heading, fontSize: FontSize.lg, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
})
