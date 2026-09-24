import { Platform, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { Colors, Fonts } from '@/constants/theme'

const WORDMARK = 'BWRWSAI'
const wordmarkGradient = ['#ffffff', '#ffffff', '#8ef3e8', '#06c8b4'] as const
const wordmarkWebStyle = Platform.OS === 'web'
  ? {
      color: 'transparent',
      backgroundImage: 'linear-gradient(100deg, #ffffff 0%, #ffffff 34%, #8ef3e8 62%, #06c8b4 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }
  : undefined

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const wordmarkStyle = compact ? styles.wordmarkCompact : styles.wordmark
  const ruleStyle = compact ? styles.ruleCompact : styles.rule
  const subStyle = compact ? styles.subCompact : styles.sub

  return (
    <View style={compact ? styles.wrapLeft : styles.wrap}>
      {Platform.OS === 'web' ? (
        <Text style={[wordmarkStyle, wordmarkWebStyle]}>{WORDMARK}</Text>
      ) : (
        <MaskedView maskElement={<Text style={wordmarkStyle}>{WORDMARK}</Text>}>
          <LinearGradient
            colors={wordmarkGradient}
            locations={[0, 0.34, 0.62, 1]}
            start={{ x: 0, y: 0.15 }}
            end={{ x: 1, y: 0.85 }}
          >
            <Text style={[wordmarkStyle, styles.spacer]}>{WORDMARK}</Text>
          </LinearGradient>
        </MaskedView>
      )}
      <LinearGradient
        colors={['rgba(6,200,180,0)', '#06c8b4', '#5eead4', '#06c8b4', 'rgba(6,200,180,0)']}
        locations={[0, 0.12, 0.5, 0.88, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={ruleStyle}
      />
      <Text style={subStyle}>Water Billing Management System</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  wrapLeft: { alignItems: 'flex-start', maxWidth: 118 },
  wordmark: {
    fontFamily: Fonts.headingHeavy,
    fontSize: 34,
    letterSpacing: 1,
    color: Colors.white,
    textAlign: 'center',
  },
  wordmarkCompact: {
    fontFamily: Fonts.headingHeavy,
    fontSize: 13,
    letterSpacing: 0.2,
    color: Colors.white,
  },
  spacer: { opacity: 0 },
  rule: {
    alignSelf: 'stretch',
    height: 2,
    marginTop: 8,
    borderRadius: 2,
  },
  ruleCompact: {
    alignSelf: 'stretch',
    height: 1,
    marginTop: 2,
    borderRadius: 2,
  },
  sub: {
    marginTop: 10,
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: 'rgba(214, 228, 234, 0.72)',
    textAlign: 'center',
  },
  subCompact: {
    marginTop: 2,
    fontFamily: Fonts.bodySemi,
    fontSize: 6,
    letterSpacing: 0.15,
    textTransform: 'uppercase',
    color: 'rgba(214, 228, 234, 0.72)',
  },
})
