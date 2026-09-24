import { ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { Colors, Fonts, FontSize } from '@/constants/theme'

type Props = {
  title: string
  subtitle?: string
  eyebrow?: string
  onBack?: () => void
  right?: ReactNode
}

export function ScreenBar({ title, subtitle, eyebrow, onBack, right }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity style={styles.back} onPress={onBack} activeOpacity={0.75} hitSlop={8}>
            <Feather name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.copy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.accentDark,
    marginBottom: 1,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    opacity: 0.85,
  },
})
