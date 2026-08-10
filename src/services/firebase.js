// Firebase configuration for the Mobile App
import { initializeApp }     from 'firebase/app'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore }      from 'firebase/firestore'
import AsyncStorage          from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey:            "AIzaSyAnxtOKNRly9RtTuoezuS9kRAySylppz6I",
  authDomain:        "bwrwsai-d3955.firebaseapp.com",
  projectId:         "bwrwsai-d3955",
  storageBucket:     "bwrwsai-d3955.firebasestorage.app",
  messagingSenderId: "673464591555",
  appId:             "1:673464591555:web:a18a0221f3e13a9be06e76",
}

const app        = initializeApp(firebaseConfig)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})
export const db   = getFirestore(app)