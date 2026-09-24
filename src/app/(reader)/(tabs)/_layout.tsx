import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors, Fonts, FontSize } from '@/constants/theme'
import { WaterScene } from '@/components/water-scene'

type TabBarProps = {
  state: any
  descriptors: any
  navigation: any
}

const TAB_ORDER = ['home', 'scanner', 'history', 'profile'] as const

const TAB_ICONS: Record<string, { icon: keyof typeof Feather.glyphMap; label: string }> = {
  home: { icon: 'grid', label: 'Home' },
  scanner: { icon: 'maximize', label: 'Scan' },
  history: { icon: 'clock', label: 'History' },
  profile: { icon: 'user', label: 'Profile' },
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets()
  const visibleRoutes = TAB_ORDER
    .map((name) => state.routes.find((r: any) => r.name === name))
    .filter(Boolean)

  return (
    <WaterScene bubblesOnly contained>
      <View style={[styles.tabBarWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.tabBar}>
        {visibleRoutes.map((route: any) => {
          const isFocused = state.index === state.routes.indexOf(route)
          const icon = TAB_ICONS[route.name]

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          return (
            <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
              <View style={styles.tabIconWrap}>
                {isFocused ? <View style={styles.activeMark} /> : null}
                <Feather
                  name={icon.icon}
                  size={18}
                  color={isFocused ? Colors.accent : 'rgba(255,255,255,0.4)'}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{icon.label}</Text>
            </TouchableOpacity>
          )
        })}
        </View>
      </View>
    </WaterScene>
  )
}

export const unstable_settings = {
  initialRouteName: 'home',
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="scanner" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 6,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMark: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  tabLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  tabLabelActive: {
    fontFamily: Fonts.bodyBold,
    color: Colors.white,
  },
})
