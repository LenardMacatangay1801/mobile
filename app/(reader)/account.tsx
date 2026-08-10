import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

type Mode = 'view' | 'editName' | 'editEmail' | 'changePassword'

export default function AccountScreen() {
  const { userName, user } = useAuth()

  // Local state — frontend only, no persistence
  const [displayName, setDisplayName] = useState(userName ?? 'Meter Reader')
  const [displayEmail, setDisplayEmail] = useState(user?.email ?? 'reader@bwrwsai.com')
  const [mode, setMode] = useState<Mode>('view')

  // Edit name fields
  const [draftName, setDraftName] = useState(displayName)

  // Edit email fields
  const [draftEmail, setDraftEmail] = useState(displayEmail)

  // Change password fields
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwError, setPwError] = useState('')

  function saveName() {
    if (!draftName.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return }
    setDisplayName(draftName.trim())
    setMode('view')
    Alert.alert('Success', 'Display name updated.')
  }

  function saveEmail() {
    if (!draftEmail.trim() || !draftEmail.includes('@')) { Alert.alert('Error', 'Enter a valid email address.'); return }
    setDisplayEmail(draftEmail.trim())
    setMode('view')
    Alert.alert('Success', 'Email address updated.')
  }

  function savePassword() {
    setPwError('')
    if (!currentPw) { setPwError('Please enter your current password.'); return }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    // Frontend only — just show success
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setMode('view')
    Alert.alert('Success', 'Password changed successfully.')
  }

  function cancelEdit() {
    setDraftName(displayName)
    setDraftEmail(displayEmail)
    setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError('')
    setMode('view')
  }

  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <Text style={styles.headerSub}>Manage your profile information</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarName}>{displayName}</Text>
          <Text style={styles.avatarEmail}>{displayEmail}</Text>
          <View style={styles.rolePill}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>Meter Reader</Text>
          </View>
        </View>

        {/* --- View mode --- */}
        {mode === 'view' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              <View style={styles.card}>
                {/* Name row */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <Text style={styles.fieldValue}>{displayName}</Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setDraftName(displayName); setMode('editName') }}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {/* Email row */}
                <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.fieldLeft}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <Text style={styles.fieldValue}>{displayEmail}</Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setDraftEmail(displayEmail); setMode('editEmail') }}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <View style={styles.card}>
                <TouchableOpacity style={[styles.fieldRow, { borderBottomWidth: 0 }]} onPress={() => setMode('changePassword')} activeOpacity={0.75}>
                  <View style={[styles.menuIconWrap, { marginRight: 12 }]}>
                    <Text style={styles.menuIcon}>🔒</Text>
                  </View>
                  <View style={styles.fieldLeft}>
                    <Text style={styles.fieldValue}>Change Password</Text>
                    <Text style={styles.fieldLabel}>Update your login password</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Read-only info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Employee ID</Text>
                  <Text style={styles.fieldValue}>EMP-2026-041</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Role</Text>
                  <Text style={styles.fieldValue}>Meter Reader</Text>
                </View>
                <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.fieldLabel}>Account Status</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* --- Edit Name --- */}
        {mode === 'editName' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Full Name</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="Enter full name"
                  placeholderTextColor={Colors.textMuted}
                  autoFocus
                />
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* --- Edit Email --- */}
        {mode === 'editEmail' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Email Address</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={draftEmail}
                  onChangeText={setDraftEmail}
                  placeholder="Enter email address"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEmail}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* --- Change Password --- */}
        {mode === 'changePassword' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <View style={styles.card}>
              {/* Current password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.pwRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={currentPw}
                    onChangeText={setCurrentPw}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showCurrentPw}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrentPw(v => !v)}>
                    <Text style={styles.eyeIcon}>{showCurrentPw ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* New password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.pwRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newPw}
                    onChangeText={setNewPw}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showNewPw}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNewPw(v => !v)}>
                    <Text style={styles.eyeIcon}>{showNewPw ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Confirm password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.pwRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                    placeholder="Re-enter new password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showConfirmPw}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPw(v => !v)}>
                    <Text style={styles.eyeIcon}>{showConfirmPw ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {pwError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{pwError}</Text>
                </View>
              ) : null}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={savePassword}>
                  <Text style={styles.saveBtnText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  backIcon: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  body: { flex: 1, padding: 16 },
  avatarSection: {
    alignItems: 'center', paddingVertical: 24,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...Shadow.md,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  avatarName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  avatarEmail: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 10 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: '#c7d9fb',
  },
  roleDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: Colors.accent },
  roleText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary, marginBottom: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fieldLeft: { flex: 1 },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  fieldValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  editBtn: {
    backgroundColor: '#e8f0fe', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  editBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 16 },
  chevron: { fontSize: 22, color: Colors.textMuted },
  activeBadge: { backgroundColor: '#e6faf3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  activeBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success },
  inputGroup: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  inputLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  input: {
    height: 46, backgroundColor: Colors.background,
    borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },
  errorCard: {
    marginHorizontal: 14, marginBottom: 4, backgroundColor: '#fff1f2',
    borderRadius: Radius.sm, padding: 10,
    borderWidth: 1, borderColor: '#fecdd3',
  },
  errorText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row', gap: 10, padding: 14,
  },
  cancelBtn: {
    flex: 1, height: 46, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  saveBtn: {
    flex: 2, height: 46, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.sm, backgroundColor: Colors.primary, ...Shadow.sm,
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
})
