import { Redirect, Stack } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { Colors } from '@/constants/theme'
import { isMeterReader } from '@/services/supabase'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function ReaderLayout() {
  const { user, role, loading, busy } = useAuth()

  if (loading || busy === 'restoring') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    )
  }

  if (!user || !isMeterReader(role)) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="consumer" />
      <Stack.Screen name="meter-scan" />
      <Stack.Screen name="result" />
      <Stack.Screen name="help" />
      <Stack.Screen name="account" />
      <Stack.Screen name="export-report" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: Colors.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
