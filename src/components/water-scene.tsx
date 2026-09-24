import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/theme'

type BubbleSpec = {
  id: number
  size: number
  left: number
  duration: number
  start: number
}

function RisingBubble({ size, left, duration, start, travel }: BubbleSpec & { travel: number }) {
  const progress = useRef(new Animated.Value(start)).current

  useEffect(() => {
    const remaining = Math.max((1 - start) * duration, 400)
    const rise = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: remaining, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }),
        ]),
      ),
    ])
    rise.start()
    return () => rise.stop()
  }, [duration, progress, start])

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, -travel],
  })
  const opacity = progress.interpolate({
    inputRange: [0, 0.06, 0.82, 1],
    outputRange: [0.2, 0.62, 0.5, 0],
  })

  return (
      <Animated.View
      style={[
        styles.noPointer,
        styles.bubble,
        {
          width: size,
          height: size,
          left: `${left}%`,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  )
}

export function WaterScene({
  children,
  bubblesOnly = false,
  contained = false,
}: {
  children: React.ReactNode
  bubblesOnly?: boolean
  contained?: boolean
}) {
  const { height: screenHeight } = useWindowDimensions()
  const [bandHeight, setBandHeight] = useState(72)
  const travel = contained ? bandHeight + 12 : screenHeight + 40
  const count = contained ? 10 : 18

  const bubbles = useMemo<BubbleSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: contained ? 5 + ((i * 2) % 4) : 6 + ((i * 5) % 14),
        left: (i * 17 + 6) % 90,
        duration: (contained ? 7000 : 12000) + (i % 5) * (contained ? 1200 : 2200),
        start: 0.08 + (i / Math.max(count - 1, 1)) * 0.84,
      })),
    [contained, count],
  )

  return (
    <View
      style={contained ? styles.band : styles.root}
      onLayout={contained ? (event) => setBandHeight(event.nativeEvent.layout.height) : undefined}
    >
      <LinearGradient
        colors={contained ? ['#14648a', '#0f3a56', '#071a2b'] : ['#0f3a56', Colors.deep2, Colors.deep]}
        locations={[0, contained ? 0.45 : 0.42, 1]}
        start={contained ? { x: 0, y: 0 } : { x: 0.15, y: 0 }}
        end={contained ? { x: 1, y: 1 } : { x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {bubblesOnly || contained ? null : (
        <>
          <View style={[styles.glow, styles.glowBlue, styles.noPointer]} />
          <View style={[styles.glow, styles.glowTeal, styles.noPointer]} />
          <View style={[styles.caustic, styles.noPointer]} />
          <View style={[styles.waveBack, styles.noPointer]} />
          <View style={[styles.waveFront, styles.noPointer]} />
        </>
      )}
      {bubbles.map((bubble) => (
        <RisingBubble key={bubble.id} {...bubble} travel={travel} />
      ))}
      <View style={contained ? styles.bandContent : styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.deep, overflow: 'hidden' },
  band: { backgroundColor: Colors.deep, overflow: 'hidden' },
  noPointer: { pointerEvents: 'none' },
  content: { flex: 1, zIndex: 2 },
  bandContent: { zIndex: 2 },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  glowBlue: {
    width: 280,
    height: 280,
    backgroundColor: Colors.primary,
    top: -90,
    left: -80,
  },
  glowTeal: {
    width: 240,
    height: 240,
    backgroundColor: Colors.accent,
    bottom: -70,
    right: -60,
  },
  caustic: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: 'rgba(6, 200, 180, 0.12)',
  },
  bubble: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  waveBack: {
    position: 'absolute',
    left: -30,
    right: -10,
    bottom: -8,
    height: 78,
    backgroundColor: '#0e3a52',
    opacity: 0.55,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 90,
  },
  waveFront: {
    position: 'absolute',
    left: -10,
    right: -40,
    bottom: -18,
    height: 58,
    backgroundColor: '#0a2c40',
    opacity: 0.9,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 160,
  },
})
