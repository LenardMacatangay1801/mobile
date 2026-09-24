import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { BrandLockup } from '@/components/brand-lockup'
import { WaterScene } from '@/components/water-scene'
import { Colors, Fonts, FontSize } from '@/constants/theme'

export function DashboardHeader() {
  const { userName } = useAuth()
  const insets = useSafeAreaInsets()

  return (
    <WaterScene bubblesOnly contained>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerTop}>
          <BrandLockup compact />
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => router.push('/(reader)/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitial}>{(userName ?? 'M')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WaterScene>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  avatarInitial: { fontFamily: Fonts.heading, fontSize: FontSize.sm, color: Colors.white },
})
