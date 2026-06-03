// src/lib/firebase.ts
// Firebase Authentication + Firestore configuration for SchoolCBT
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { browser } from '$app/environment'

// ─── FIREBASE CONFIG ────────────────────────────────────────
// Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
)

// ─── INITIALIZE ─────────────────────────────────────────────
let app: FirebaseApp

if (browser && firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export const auth = browser && firebaseConfigured ? getAuth(app!) : null

// ─── AUTH HELPERS ───────────────────────────────────────────
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: 'student' | 'tutor',
) {
  if (!auth) throw new Error('Firebase not initialized')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await sendEmailVerification(cred.user)

  return cred.user
}

export async function loginUser(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logoutUser() {
  if (!auth) throw new Error('Firebase not initialized')
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export async function sendPasswordReset(email: string) {
  if (!auth) throw new Error('Firebase not initialized')
  await sendPasswordResetEmail(auth, email)
}

export async function sendVerificationEmail() {
  if (!auth?.currentUser) throw new Error('No user logged in')
  await sendEmailVerification(auth.currentUser)
}
