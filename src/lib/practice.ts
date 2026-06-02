import type { ExamType, Question } from '$lib/stores'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type DifficultyFilter = Difficulty | 'Mixed'
export type PracticeMode = 'practice' | 'mock' | 'exam'

export const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO', 'NABTEB', 'POST-UTME'] as const

export const SUBJECT_OPTIONS = [
  {
    subject: 'Physics',
    exams: ['WAEC', 'JAMB', 'NECO'] as ExamType[],
    topics: ['Mechanics', 'Electricity', 'Waves', 'Thermal Physics', 'Optics'],
  },
  {
    subject: 'Mathematics',
    exams: ['WAEC', 'JAMB', 'NECO', 'POST-UTME'] as ExamType[],
    topics: ['Algebra', 'Logarithms', 'Geometry', 'Calculus', 'Sets', 'Statistics'],
  },
  {
    subject: 'English',
    exams: ['WAEC', 'JAMB', 'NECO', 'NABTEB', 'POST-UTME'] as ExamType[],
    topics: ['Comprehension', 'Vocabulary', 'Grammar', 'Oral English', 'Essay Skills'],
  },
  {
    subject: 'Chemistry',
    exams: ['WAEC', 'JAMB', 'NECO', 'NABTEB'] as ExamType[],
    topics: ['Acids', 'Stoichiometry', 'Organic Chemistry', 'Atomic Structure', 'Electrolysis'],
  },
  {
    subject: 'Biology',
    exams: ['WAEC', 'JAMB', 'NECO'] as ExamType[],
    topics: ['Cells', 'Ecology', 'Genetics', 'Nutrition', 'Reproduction'],
  },
  {
    subject: 'Economics',
    exams: ['WAEC', 'JAMB', 'NECO'] as ExamType[],
    topics: ['Demand and Supply', 'Market Structures', 'National Income', 'Money', 'Trade'],
  },
  {
    subject: 'Government',
    exams: ['WAEC', 'JAMB', 'NECO'] as ExamType[],
    topics: ['Constitution', 'Federalism', 'Democracy', 'Political Parties', 'Public Service'],
  },
  {
    subject: 'Civic Education',
    exams: ['WAEC', 'NECO'] as ExamType[],
    topics: ['Citizenship', 'Human Rights', 'Values', 'Democracy', 'Rule of Law'],
  },
] as const

export const MODE_SETTINGS: Record<
  PracticeMode,
  { label: string; questionCount: number; secondsPerQuestion: number; pointsPerQuestion: number }
> = {
  practice: {
    label: 'Practice',
    questionCount: 5,
    secondsPerQuestion: 50,
    pointsPerQuestion: 2,
  },
  mock: {
    label: 'Mock CBT',
    questionCount: 20,
    secondsPerQuestion: 45,
    pointsPerQuestion: 2,
  },
  exam: {
    label: 'Live Exam',
    questionCount: 50,
    secondsPerQuestion: 40,
    pointsPerQuestion: 2,
  },
}

export type PracticeDraft = {
  version: 2
  sessionId: string | null
  subject: string
  examType: ExamType
  topics: string[]
  difficulty: DifficultyFilter
  mode: PracticeMode
  questions: Question[]
  answers: (number | null)[]
  skipped: boolean[]
  currentQ: number
  startedAt: number | null
  questionStartedAt: number | null
  timeLeft: number
  source: 'convex' | 'generated' | 'fallback'
  savedAt: number
}

export function practiceCacheKey(uid: string | undefined, mode: PracticeMode) {
  return `schoolcbt.practice.${uid ?? 'guest'}.${mode}`
}

export function shuffleArray<T>(items: T[], seed = Date.now() + Math.random()) {
  const next = [...items]
  let state = Math.abs(Math.floor(seed)) || 1
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function randomizeQuestionOptions<T extends Question>(question: T, seed?: number): T {
  const optionRows = question.opts.map((option, index) => ({
    option,
    wasCorrect: index === question.correct,
  }))
  const randomized = shuffleArray(optionRows, seed)
  return {
    ...question,
    opts: randomized.map(row => row.option),
    correct: randomized.findIndex(row => row.wasCorrect),
  }
}

export function randomizeQuestionBatch<T extends Question>(questions: T[], seed = Date.now()) {
  return shuffleArray(questions, seed).map((question, index) =>
    randomizeQuestionOptions(question, seed + index + 1),
  )
}

export function selectedSubjectMeta(subject: string) {
  return SUBJECT_OPTIONS.find(item => item.subject === subject) ?? SUBJECT_OPTIONS[0]
}
