import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, FontSize, Shadow } from '@/constants/theme'

type TabBarProps = {
  state: any
  descriptors: any
  navigation: any
}

const TAB_ICONS: Record<string, { active: string; inactive: string; label: string }> = {
  home:    { active: '⊞', inactive: '⊟', label: 'Home'    },
  scanner: { active: '⬡', inactive: '⬡', label: 'Scan'    },
  history: { active: '☰', inactive: '☰', label: 'History' },
  profile: { active: '◉', inactive: '◎', label: 'Profile' },
}

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const visibleRoutes = state.routes.filter((r: any) =>
    ['home', 'scanner', 'history', 'profile'].includes(r.name)
  )

  return (
    <View style={styles.tabBarWrap}>
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
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                  {isFocused ? icon.active : icon.inactive}
                </Text>
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{icon.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default function ReaderLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="scanner" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="consumer"       options={{ href: null }} />
      <Tabs.Screen name="meter-scan"     options={{ href: null }} />
      <Tabs.Screen name="result"         options={{ href: null }} />
      <Tabs.Screen name="account"        options={{ href: null }} />
      <Tabs.Screen name="export-report"  options={{ href: null }} />
      <Tabs.Screen name="help"           options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarWrap: {
    backgroundColor: Colors.white,
    paddingBottom: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabIconWrapActive: {
    backgroundColor: '#e8f0fe',
  },
  tabIcon: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  tabIconActive: {
    color: Colors.primary,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
})
