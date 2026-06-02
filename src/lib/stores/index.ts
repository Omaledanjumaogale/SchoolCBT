// src/lib/stores/index.ts
import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'

// ─── TYPES ──────────────────────────────────────────────────
export type UserRole = 'student' | 'tutor' | 'admin' | null
export type ExamType = 'JAMB' | 'WAEC' | 'NECO' | 'NABTEB' | 'POST-UTME'

export interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  photoURL?: string
  examTypes?: ExamType[]
  school?: string
  state?: string
  subscriptionActive?: boolean
}

export interface Question {
  id: string
  q: string
  opts: string[]
  correct: number
  bloom: string
  exp: string
  subject: string
  topic: string
  examType: ExamType
  difficulty: 'Easy' | 'Medium' | 'Hard'
  year?: number
}

export interface BatchSession {
  id: string
  subject: string
  examType: ExamType
  questions: Question[]
  answers: (number | null)[]
  score: number
  startedAt: Date
  completedAt?: Date
  timeTaken: number
}

export interface DashboardStats {
  totalQuestions: number
  totalBatches: number
  totalHours: number
  avgScore: number
  passProb: number
  streakDays: number
  awards: string[]
}

// ─── AUTH STORE ─────────────────────────────────────────────
function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null)
  return {
    subscribe,
    set,
    login: (user: User) => set(user),
    logout: () => set(null),
    update: (partial: Partial<User>) => update(u => (u ? { ...u, ...partial } : null)),
  }
}
export const authStore = createAuthStore()
export const isAuthenticated = derived(authStore, $u => $u !== null)
export const userRole = derived(authStore, $u => $u?.role ?? null)

// ─── CBT SESSION STORE ──────────────────────────────────────
function createCBTStore() {
  const initial: Partial<BatchSession> & {
    currentQ: number
    timeLeft: number
    isRunning: boolean
    subject: string
    examType: ExamType
  } = {
    currentQ: 0,
    timeLeft: 50,
    isRunning: false,
    subject: 'Physics',
    examType: 'WAEC',
    questions: [],
    answers: [],
    score: 0,
  }

  const { subscribe, set, update } = writable(initial)

  return {
    subscribe,
    setSubject: (subject: string, examType: ExamType) => update(s => ({ ...s, subject, examType })),
    setQuestions: (questions: Question[]) =>
      update(s => ({
        ...s,
        questions,
        answers: new Array(questions.length).fill(null),
        currentQ: 0,
        score: 0,
        timeLeft: 50,
        isRunning: true,
        startedAt: new Date(),
      })),
    answerQuestion: (qIndex: number, answerIndex: number) =>
      update(s => {
        const newAnswers = [...(s.answers ?? [])]
        newAnswers[qIndex] = answerIndex
        const q = s.questions?.[qIndex]
        const correct = q && answerIndex === q.correct
        return { ...s, answers: newAnswers, score: (s.score ?? 0) + (correct ? 2 : 0) }
      }),
    nextQuestion: () =>
      update(s => ({
        ...s,
        currentQ: Math.min((s.currentQ ?? 0) + 1, (s.questions?.length ?? 1) - 1),
        timeLeft: 50,
      })),
    prevQuestion: () => update(s => ({ ...s, currentQ: Math.max((s.currentQ ?? 0) - 1, 0) })),
    jumpTo: (i: number) => update(s => ({ ...s, currentQ: i })),
    tickTimer: () => update(s => ({ ...s, timeLeft: Math.max((s.timeLeft ?? 0) - 1, 0) })),
    reset: () => set(initial),
  }
}
export const cbtStore = createCBTStore()

// ─── DASHBOARD STORE ────────────────────────────────────────
export const dashboardStats = writable<DashboardStats>({
  totalQuestions: 1850,
  totalBatches: 37,
  totalHours: 42.3,
  avgScore: 78,
  passProb: 87,
  streakDays: 7,
  awards: ['gold-math', 'silver-physics', 'streak-7'],
})

// ─── UI STORE ───────────────────────────────────────────────
export const uiStore = writable({
  mobileMenuOpen: false,
  signupModal: false,
  loginModal: false,
  activeTab: 'overview',
  toastMessage: '',
  toastVisible: false,
  isLoading: false,
})

export function showModal(modal: 'signup' | 'login') {
  uiStore.update(s => ({
    ...s,
    signupModal: modal === 'signup',
    loginModal: modal === 'login',
  }))
}

export function hideModals() {
  uiStore.update(s => ({ ...s, signupModal: false, loginModal: false }))
}

export function showToast(msg: string, duration = 3500) {
  uiStore.update(s => ({ ...s, toastMessage: msg, toastVisible: true }))
  setTimeout(() => uiStore.update(s => ({ ...s, toastVisible: false })), duration)
}

export function toggleMobileMenu() {
  uiStore.update(s => ({ ...s, mobileMenuOpen: !s.mobileMenuOpen }))
}

// ─── PERSIST TO LOCALSTORAGE ────────────────────────────────
if (browser) {
  const stored = localStorage.getItem('schoolcbt_session')
  if (stored) {
    try {
      const session = JSON.parse(stored)
      if (session?.uid) authStore.set(session)
    } catch {
      /* ignore */
    }
  }

  authStore.subscribe(user => {
    if (user) localStorage.setItem('schoolcbt_session', JSON.stringify(user))
    else localStorage.removeItem('schoolcbt_session')
  })
}
