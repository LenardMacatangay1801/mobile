import { Redirect } from 'expo-router'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { Colors, Fonts, FontSize } from '@/constants/theme'
import { WaterScene } from '@/components/water-scene'
import { isMeterReader } from '@/services/supabase'

export default function Index() {
  const { user, role, loading, busy } = useAuth()

  if (loading || busy === 'restoring' || busy === 'signingOut') {
    return (
      <WaterScene>
        <View style={styles.root}>
          <View style={styles.logoWrap}>
            <Feather name="droplet" size={28} color={Colors.white} />
          </View>
          <Text style={styles.brand}>BWRWSAI</Text>
          <Text style={styles.sub}>
            {busy === 'signingOut' ? 'Signing you out…' : 'Preparing your workspace…'}
          </Text>
          <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 24 }} />
        </View>
      </WaterScene>
    )
  }

  if (user && isMeterReader(role)) {
    return <Redirect href="/(reader)/(tabs)/home" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brand: {
    fontFamily: Fonts.headingHeavy,
    fontSize: FontSize.xxl,
    color: Colors.white,
    letterSpacing: 3,
  },
  sub: {
    marginTop: 8,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(234,246,248,0.65)',
  },
})
