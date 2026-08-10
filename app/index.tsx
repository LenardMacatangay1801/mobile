import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { Colors } from '@/constants/theme'

export default function Index() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    )
  }

  if (user && role === 'meter-reader') {
    return <Redirect href="/(reader)/home" />
  }

  return <Redirect href="/(auth)/login" />
}
