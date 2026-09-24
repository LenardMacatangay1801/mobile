import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useRoute } from '@/context/RouteContext'
import { DashboardHeader } from '@/components/dashboard-header'
import { Colors, Fonts, FontSize, Radius, Shadow } from '@/constants/theme'

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
  const { counts, resetDemoRoute } = useRoute()

  const initials = (userName ?? 'MR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const doneToday = counts.read + counts.blocked

  function handleReset() {
    Alert.alert(
      'Reset demo route',
      'Clear all saved readings on this phone and mark every consumer as unread?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetDemoRoute },
      ],
    )
  }

  return (
    <View style={styles.root}>
      <DashboardHeader />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>
      <View style={styles.header}>
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

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{counts.total}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doneToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{counts.unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
        </View>

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
              <Text style={styles.infoValue}>{counts.total}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Billing Cycle</Text>
              <Text style={styles.infoValue}>May 15 – Jun 15, 2026</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <MenuItem
              icon="↻"
              label="Reset demo route"
              sub="Clear readings for another walkthrough"
              onPress={handleReset}
            />
            <MenuItem
              icon="?"
              label="Help & Support"
              sub="FAQs & contact your administrator"
              onPress={() => router.push('/(reader)/help')}
            />
            <MenuItem
              icon="⊠"
              label="Sign Out"
              sub="Sign out of this device"
              onPress={() => {
                void logout()
              }}
              danger
            />
          </View>
        </View>

        <Text style={styles.appVersion}>BWRWSAI Mobile v1.0.0  ·  © 2026</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.card,
    paddingTop: 22, paddingBottom: 22, paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.heading, fontSize: FontSize.xxl, color: Colors.white },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 99,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.card,
  },
  avatarBadgeText: { fontSize: 7, color: Colors.white },
  userName: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 14 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(6,200,180,0.12)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
  },
  roleDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.accent },
  roleText: { fontFamily: Fonts.bodySemi, fontSize: FontSize.xs, color: Colors.accentDark },
  body: { flex: 1, padding: 16 },
  pageTitle: { fontFamily: Fonts.bodyBold, fontSize: 26, color: Colors.textPrimary, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: Fonts.bodySemi, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.textSecondary, marginBottom: 10 },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
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
    backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorBg },
  menuIcon: { fontSize: 16 },
  menuContent: { flex: 1 },
  menuLabel: { fontFamily: Fonts.bodyBold, fontSize: FontSize.sm, color: Colors.textPrimary },
  menuLabelDanger: { color: Colors.error },
  menuSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  menuArrow: { fontSize: 20, color: Colors.textMuted },
  appVersion: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: 8 },
})
