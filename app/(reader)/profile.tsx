import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

type MenuItemProps = { icon: string; label: string; sub?: string; onPress?: () => void; danger?: boolean }
function MenuItem({ icon, label, sub, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { userName, user, logout } = useAuth()

  const initials = (userName ?? 'MR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlobA} />
        <View style={styles.headerBlobB} />

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>●</Text>
          </View>
        </View>

        <Text style={styles.userName}>{userName ?? 'Meter Reader'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? 'reader@bwrwsai.com'}</Text>

        <View style={styles.rolePill}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>Meter Reader</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>Total Reads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>May</Text>
            <Text style={styles.statLabel}>Cycle</Text>
          </View>
        </View>

        {/* Assignment info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zone</Text>
              <Text style={styles.infoValue}>Banaba West – Zone 2</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supervisor</Text>
              <Text style={styles.infoValue}>Engr. Dela Cruz</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned Consumers</Text>
              <Text style={styles.infoValue}>48</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Billing Cycle</Text>
              <Text style={styles.infoValue}>May 15 – Jun 15, 2026</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <MenuItem icon="◉" label="My Account"      sub="View & update profile details"   onPress={() => router.push('/(reader)/account')} />
            <MenuItem icon="↓" label="Export Reports"  sub="Download monthly summary"        onPress={() => router.push('/(reader)/export-report')} />
            <MenuItem icon="?" label="Help & Support"  sub="FAQs & contact your administrator" onPress={() => router.push('/(reader)/help')} />
            <MenuItem
              icon="⊠" label="Sign Out"
              sub="Sign out of this device"
              onPress={logout}
              danger
            />
          </View>
        </View>

        {/* App info */}
        <Text style={styles.appVersion}>BWRWSAI Mobile v1.0.0  ·  © 2026</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20,
    alignItems: 'center', overflow: 'hidden',
  },
  headerBlobA: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60, right: -40,
  },
  headerBlobB: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 999, backgroundColor: 'rgba(6,200,180,0.15)',
    bottom: -30, left: 30,
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 99,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  avatarBadgeText: { fontSize: 7, color: Colors.white },
  userName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  userEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  roleDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.accent },
  roleText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '600' },
  body: { flex: 1, padding: 16 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary, marginBottom: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#fff1f2' },
  menuIcon: { fontSize: 16 },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  menuLabelDanger: { color: Colors.error },
  menuSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  appVersion: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: 8 },
})
