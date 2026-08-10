import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/context/AuthContext'
import 'react-native-reanimated'

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(reader)" />
      </Stack>
    </AuthProvider>
  )
}
