import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Modal, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BrandLockup } from '@/components/brand-lockup'
import { WaterScene } from '@/components/water-scene'
import { Colors, Fonts, FontSize } from '@/constants/theme'

export type AuthBusyKind = 'restoring' | 'signingIn' | 'signingOut'

const MESSAGES: Record<AuthBusyKind, { kicker: string; title: string; sub: string }> = {
  restoring: {
    kicker: 'Session',
    title: 'BWRWSAI',
    sub: 'Checking your session…',
  },
  signingIn: {
    kicker: 'Signing in',
    title: 'Welcome back',
    sub: 'Preparing your meter reading route…',
  },
  signingOut: {
    kicker: 'Signing out',
    title: 'See you next route',
    sub: 'Clearing this device session…',
  },
}

type Props = {
  visible: boolean
  kind: AuthBusyKind
}

export function AuthLoadingOverlay({ visible, kind }: Props) {
  const { height } = useWindowDimensions()
  const [mounted, setMounted] = useState(visible)
  const [activeKind, setActiveKind] = useState<AuthBusyKind>(kind)
  const [trackWidth, setTrackWidth] = useState(196)
  const travel = useRef(new Animated.Value(0)).current
  const level = useRef(new Animated.Value(kind === 'signingOut' ? 1 : 0)).current

  const draining = activeKind === 'signingOut'

  useEffect(() => {
    if (!visible) return
    setActiveKind(kind)
    setMounted(true)
    travel.stopAnimation()
    travel.setValue(0)
    level.setValue(kind === 'signingOut' ? 1 : 0)
    Animated.spring(travel, {
      toValue: 1,
      friction: 8,
      tension: 64,
      useNativeDriver: true,
    }).start()
    Animated.timing(level, {
      toValue: kind === 'signingOut' ? 0 : 1,
      duration: kind === 'signingOut' ? 1200 : 1500,
      useNativeDriver: false,
    }).start()
  }, [visible, kind, travel, level])

  useEffect(() => {
    if (visible || !mounted) return
    travel.stopAnimation()
    const exit = Animated.timing(travel, {
      toValue: 2,
      duration: 560,
      useNativeDriver: true,
    })
    exit.start(({ finished }) => {
      if (finished) setMounted(false)
    })
    return () => exit.stop()
  }, [visible, mounted, travel])

  if (!mounted) return null

  const copy = MESSAGES[activeKind]
  const opacity = travel.interpolate({
    inputRange: [0, 0.18, 1, 1.55, 2],
    outputRange: [0, 1, 1, 1, 0],
  })
  const translateY = travel.interpolate({
    inputRange: [0, 1, 2],
    outputRange: draining
      ? [-height * 0.08, 0, height * 0.72]
      : [height * 0.34, 0, -height * 0.42],
  })
  const fillWidth = level.interpolate({
    inputRange: [0, 1],
    outputRange: [8, trackWidth],
  })

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.fill, { opacity, transform: [{ translateY }] }]}>
        <WaterScene bubblesOnly>
          <View style={styles.center}>
            <View style={styles.logo}>
              <BrandLockup />
            </View>

            <Text style={styles.kicker}>{copy.kicker}</Text>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.sub}>{copy.sub}</Text>

            <View
              style={styles.track}
              onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            >
              <Animated.View style={[styles.fillClip, { width: fillWidth }]}>
                <LinearGradient
                  colors={draining ? ['#0f3a56', '#8ef3e8'] : [Colors.primary, Colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.fillBar}
                />
              </Animated.View>
            </View>
          </View>
        </WaterScene>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    marginBottom: 28,
    width: '100%',
    maxWidth: 320,
  },
  kicker: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: Colors.accent,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xxl,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(234,246,248,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  track: {
    marginTop: 28,
    width: 196,
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  fillClip: {
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fillBar: {
    width: 196,
    height: '100%',
  },
})
