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
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
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
let db: any

if (browser && firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
}

export const auth = browser && firebaseConfigured ? getAuth(app!) : null
export { db }

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

  // Create Firestore profile
  await setDoc(doc(db!, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName: name,
    role,
    createdAt: serverTimestamp(),
    subscriptionActive: false,
    onboardingComplete: false,
  })

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

// ─── FIRESTORE HELPERS ──────────────────────────────────────
export async function getUserProfile(uid: string) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function saveSession(uid: string, sessionData: Record<string, unknown>) {
  if (!db) return
  const ref = doc(collection(db, 'sessions'))
  await setDoc(ref, {
    uid,
    ...sessionData,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserSessions(uid: string, limitN = 10) {
  if (!db) return []
  const q = query(
    collection(db, 'sessions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitN),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({
    id: d.id,
    ...d.data(),
  }))
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  if (!db) return
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
