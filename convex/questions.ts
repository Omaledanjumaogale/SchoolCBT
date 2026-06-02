// convex/questions.ts
// AI-generated question bank queries
import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'

const SEED_QUESTIONS = [
  {
    subject: 'Physics',
    examType: 'WAEC',
    topic: 'Mechanics',
    q: 'A body of mass 5 kg accelerates at 2 m/s^2. What is the net force?',
    opts: ['5 N', '10 N', '15 N', '20 N'],
    correct: 1,
    bloom: 'Application',
    exp: 'F = ma = 5 x 2 = 10 N.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Physics',
    examType: 'WAEC',
    topic: 'Electricity',
    q: 'The SI unit of electrical resistance is:',
    opts: ['Ampere', 'Volt', 'Ohm', 'Watt'],
    correct: 2,
    bloom: 'Knowledge',
    exp: 'The Ohm is the SI unit of electrical resistance.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Mathematics',
    examType: 'JAMB',
    topic: 'Logarithms',
    q: 'Evaluate log base 2 of 64.',
    opts: ['8', '6', '4', '5'],
    correct: 1,
    bloom: 'Application',
    exp: '2^6 = 64, so the value is 6.',
    difficulty: 'Medium' as const,
    grounded: true,
  },
  {
    subject: 'Mathematics',
    examType: 'JAMB',
    topic: 'Geometry',
    q: 'The sum of interior angles of a hexagon is:',
    opts: ['540 degrees', '720 degrees', '600 degrees', '480 degrees'],
    correct: 1,
    bloom: 'Knowledge',
    exp: 'For n sides, sum = (n - 2) x 180 = 720 degrees.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'English',
    examType: 'WAEC',
    topic: 'Vocabulary',
    q: 'Choose the antonym of benevolent.',
    opts: ['Kind', 'Malevolent', 'Generous', 'Charitable'],
    correct: 1,
    bloom: 'Knowledge',
    exp: 'Malevolent means having harmful or evil intent.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Chemistry',
    examType: 'NECO',
    topic: 'Acids',
    q: 'The formula for sulfuric acid is:',
    opts: ['HCl', 'H2SO3', 'H2SO4', 'H3PO4'],
    correct: 2,
    bloom: 'Knowledge',
    exp: 'Sulfuric acid is H2SO4.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Biology',
    examType: 'JAMB',
    topic: 'Cells',
    q: 'The powerhouse of the cell is the:',
    opts: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi body'],
    correct: 2,
    bloom: 'Knowledge',
    exp: 'Mitochondria produce ATP through cellular respiration.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Economics',
    examType: 'WAEC',
    topic: 'Demand and Supply',
    q: 'A rise in the price of a commodity usually causes quantity demanded to:',
    opts: ['Increase', 'Fall', 'Remain fixed', 'Double immediately'],
    correct: 1,
    bloom: 'Comprehension',
    exp: 'The law of demand states that quantity demanded falls as price rises, all else equal.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Government',
    examType: 'JAMB',
    topic: 'Federalism',
    q: 'Federalism is best described as a system where power is:',
    opts: [
      'Held only by local chiefs',
      'Shared between central and component governments',
      'Controlled by one political party',
      'Given only to the judiciary',
    ],
    correct: 1,
    bloom: 'Knowledge',
    exp: 'Federalism shares powers between national and state or regional governments.',
    difficulty: 'Easy' as const,
    grounded: true,
  },
  {
    subject: 'Civic Education',
    examType: 'WAEC',
    topic: 'Human Rights',
    q: 'The right to fair hearing protects citizens from:',
    opts: ['Due process', 'Arbitrary judgment', 'Legal counsel', 'Open trial'],
    correct: 1,
    bloom: 'Application',
    exp: 'Fair hearing ensures a person is not condemned without a fair legal process.',
    difficulty: 'Medium' as const,
    grounded: true,
  },
]

function shuffleRows<T>(rows: T[]) {
  return [...rows].sort(() => Math.random() - 0.5)
}

function randomizeOptions<T extends { opts: string[]; correct: number }>(question: T) {
  const options = question.opts.map((option, index) => ({
    option,
    correct: index === question.correct,
  }))
  const shuffled = shuffleRows(options)
  return {
    ...question,
    opts: shuffled.map(option => option.option),
    correct: shuffled.findIndex(option => option.correct),
  }
}

// Get questions by subject and exam type (randomized batch)
export const getBatch = query({
  args: {
    subject: v.string(),
    examType: v.string(),
    count: v.optional(v.number()),
    topics: v.optional(v.array(v.string())),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 50
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_subject', q => q.eq('subject', args.subject))
      .filter(q => q.eq(q.field('examType'), args.examType))
      .take(count * 2) // fetch more to randomize

    const filtered = questions.filter(question => {
      const topicOk = !args.topics?.length || args.topics.includes(question.topic)
      const difficultyOk =
        !args.difficulty || args.difficulty === 'Mixed' || question.difficulty === args.difficulty
      return topicOk && difficultyOk
    })

    const bank = filtered.length > 0 ? filtered : questions
    return shuffleRows(bank).slice(0, count).map(randomizeOptions)
  },
})

export const seedPublicBank = mutation({
  args: {},
  handler: async ctx => {
    const existing = await ctx.db.query('questions').take(1)
    if (existing.length > 0) return { inserted: 0 }

    const now = Date.now()
    for (const question of SEED_QUESTIONS) {
      await ctx.db.insert('questions', { ...question, createdAt: now })
    }

    return { inserted: SEED_QUESTIONS.length }
  },
})

// Get questions for a specific topic
export const getByTopic = query({
  args: {
    subject: v.string(),
    topic: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 20
    return await ctx.db
      .query('questions')
      .withIndex('by_topic', q => q.eq('subject', args.subject).eq('topic', args.topic))
      .take(count)
  },
})

// Insert questions (called from AI generation pipeline)
export const insertBatch = internalMutation({
  args: {
    questions: v.array(
      v.object({
        subject: v.string(),
        examType: v.string(),
        topic: v.string(),
        q: v.string(),
        opts: v.array(v.string()),
        correct: v.number(),
        bloom: v.string(),
        exp: v.string(),
        difficulty: v.union(v.literal('Easy'), v.literal('Medium'), v.literal('Hard')),
        year: v.optional(v.number()),
        grounded: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    for (const q of args.questions) {
      await ctx.db.insert('questions', { ...q, createdAt: now })
    }
    return args.questions.length
  },
})

// Count total questions
export const count = query({
  handler: async ctx => {
    const all = await ctx.db.query('questions').collect()
    return all.length
  },
})
