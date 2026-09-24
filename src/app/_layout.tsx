import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { RouteProvider } from '@/context/RouteContext'
import { AuthLoadingOverlay } from '@/components/auth-loading-overlay'
import { WaterScene } from '@/components/water-scene'
import 'react-native-reanimated'

function AuthBusyGate({ children }: { children: React.ReactNode }) {
  const { busy, loading } = useAuth()
  const kind = busy ?? (loading ? 'restoring' : null)

  return (
    <>
      {children}
      <AuthLoadingOverlay visible={kind != null} kind={kind ?? 'restoring'} />
    </>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  })

  if (!fontsLoaded) {
    return <WaterScene>{null}</WaterScene>
  }

  return (
    <AuthProvider>
      <RouteProvider>
        <AuthBusyGate>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(reader)" />
          </Stack>
        </AuthBusyGate>
      </RouteProvider>
    </AuthProvider>
  )
}
