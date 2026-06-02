import { describe, expect, it } from 'vitest'
import {
  MODE_SETTINGS,
  practiceCacheKey,
  randomizeQuestionOptions,
  selectedSubjectMeta,
} from '../src/lib/practice'
import type { Question } from '../src/lib/stores'

const question: Question = {
  id: 'q1',
  q: 'Which option is correct?',
  opts: ['Correct option', 'Wrong A', 'Wrong B', 'Wrong C'],
  correct: 0,
  bloom: 'Knowledge',
  exp: 'The first option starts as correct.',
  subject: 'Physics',
  topic: 'Mechanics',
  examType: 'WAEC',
  difficulty: 'Easy',
}

describe('practice helpers', () => {
  it('randomizes options while preserving the correct answer mapping', () => {
    const randomized = randomizeQuestionOptions(question, 12345)

    expect(randomized.opts).toHaveLength(4)
    expect(randomized.opts[randomized.correct]).toBe('Correct option')
    expect(new Set(randomized.opts)).toEqual(new Set(question.opts))
  })

  it('uses mode-specific live CBT settings', () => {
    expect(MODE_SETTINGS.practice.questionCount).toBe(5)
    expect(MODE_SETTINGS.mock.questionCount).toBe(20)
    expect(MODE_SETTINGS.exam.questionCount).toBe(50)
    expect(MODE_SETTINGS.exam.secondsPerQuestion).toBeLessThanOrEqual(
      MODE_SETTINGS.practice.secondsPerQuestion,
    )
  })

  it('builds separate cache keys per user and mode', () => {
    expect(practiceCacheKey('user-1', 'mock')).toBe('schoolcbt.practice.user-1.mock')
    expect(practiceCacheKey(undefined, 'practice')).toBe('schoolcbt.practice.guest.practice')
  })

  it('exposes subject-specific exam and topic metadata', () => {
    const meta = selectedSubjectMeta('Government')
    expect(meta.exams).toContain('JAMB')
    expect(meta.topics).toContain('Federalism')
  })
})
