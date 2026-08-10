import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const ALL_HISTORY = [
  { id: 'R001', name: 'Maria Santos',       acct: 'ACC-00142', prev: 1240, curr: 1318, date: '2026-05-27', notes: '' },
  { id: 'R002', name: 'Jose Reyes',         acct: 'ACC-00087', prev: 880,  curr: 952,  date: '2026-05-27', notes: 'Gate locked, left notice' },
  { id: 'R003', name: 'Ana Dela Cruz',      acct: 'ACC-00231', prev: 2100, curr: 2185, date: '2026-05-27', notes: '' },
  { id: 'R004', name: 'Cris Mendoza',       acct: 'ACC-00312', prev: 430,  curr: 499,  date: '2026-05-26', notes: '' },
  { id: 'R005', name: 'Gloria Fernandez',   acct: 'ACC-00174', prev: 1850, curr: 1922, date: '2026-05-26', notes: '' },
  { id: 'R006', name: 'Ramon Castillo',     acct: 'ACC-00089', prev: 760,  curr: 820,  date: '2026-05-25', notes: 'Meter reading difficult to see' },
  { id: 'R007', name: 'Perla Ocampo',       acct: 'ACC-00411', prev: 3200, curr: 3287, date: '2026-05-25', notes: '' },
  { id: 'R008', name: 'Eddie Torres',       acct: 'ACC-00063', prev: 550,  curr: 608,  date: '2026-05-24', notes: '' },
  { id: 'R009', name: 'Nora Aquino',        acct: 'ACC-00299', prev: 1105, curr: 1178, date: '2026-05-24', notes: '' },
  { id: 'R010', name: 'Ben Gutierrez',      acct: 'ACC-00137', prev: 2400, curr: 2461, date: '2026-05-23', notes: '' },
]

function calcTotal(prev: number, curr: number): number {
  const usage = curr - prev
  let subtotal = 150
  const rem = [Math.max(usage - 10, 0), 0, 0]
  const tierRates = [15.5, 18, 22]
  const tierLimits = [10, 10, Infinity]
  let r = Math.max(usage - 10, 0)
  for (let i = 0; i < 3; i++) {
    const m3 = Math.min(r, tierLimits[i])
    subtotal += m3 * tierRates[i]
    r -= m3
    if (r <= 0) break
  }
  return subtotal * 1.12
}

export default function HistoryScreen() {
  const [search, setSearch] = useState('')

  const filtered = ALL_HISTORY.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.acct.toLowerCase().includes(search.toLowerCase())
  )

  // Group by date
  const groups: Record<string, typeof ALL_HISTORY> = {}
  for (const r of filtered) {
    if (!groups[r.date]) groups[r.date] = []
    groups[r.date].push(r)
  }

  function formatDate(d: string) {
    const dt = new Date(d)
    const today = new Date()
    const yesterday = new Date(Date.now() - 86400000)
    if (dt.toDateString() === today.toDateString()) return 'Today'
    if (dt.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return dt.toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} />
        <Text style={styles.headerTitle}>Reading History</Text>
        <Text style={styles.headerSub}>{ALL_HISTORY.length} submissions this cycle</Text>
      </View>

      {/* Search */}
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
        {Object.keys(groups).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☰</Text>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        ) : null}

        {Object.entries(groups).map(([date, records]) => (
          <View key={date}>
            <Text style={styles.groupDate}>{formatDate(date)}</Text>
            {records.map((r) => {
              const usage = r.curr - r.prev
              const total = calcTotal(r.prev, r.curr)
              return (
                <View key={r.id} style={styles.historyCard}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyAvatar}>
                      <Text style={styles.historyAvatarText}>{r.name[0]}</Text>
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{r.name}</Text>
                      <Text style={styles.historyAcct}>{r.acct}</Text>
                      <Text style={styles.historyReading}>{r.prev} → {r.curr} m³ · {usage} m³ used</Text>
                      {r.notes ? <Text style={styles.historyNotes}>📝 {r.notes}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>₱{total.toFixed(0)}</Text>
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Submitted</Text>
                    </View>
                  </View>
                </View>
              )
            })}
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
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    top: -50, right: -30,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, margin: 14,
    borderRadius: Radius.md, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  searchIcon: { fontSize: 18, color: Colors.textMuted, marginRight: 8 },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  clearIcon: { fontSize: 14, color: Colors.textMuted, padding: 4 },
  body: { flex: 1, paddingHorizontal: 14 },
  groupDate: {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 4,
  },
  historyCard: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  historyLeft: { flexDirection: 'row', flex: 1, gap: 10 },
  historyAvatar: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center',
  },
  historyAvatarText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  historyInfo: { flex: 1 },
  historyName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  historyAcct: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  historyReading: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
  historyNotes: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  historyAmount: { fontSize: FontSize.md, fontWeight: '900', color: Colors.primary },
  doneBadge: { backgroundColor: '#e6faf3', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  doneBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 36, color: Colors.textMuted },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
})
