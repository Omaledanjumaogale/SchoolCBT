<script lang="ts">
  import { browser } from '$app/environment'
  import { onDestroy, onMount } from 'svelte'
  import { authStore, showModal, showToast, type ExamType, type Question } from '$lib/stores'
  import { executeMutation, queryOnce } from '$lib/convex'
  import { calculateBatchScore, getWAECGrade } from '$lib/utils/grading'
  import {
    MODE_SETTINGS,
    SUBJECT_OPTIONS,
    practiceCacheKey,
    randomizeQuestionBatch,
    selectedSubjectMeta,
    type DifficultyFilter,
    type PracticeDraft,
    type PracticeMode,
  } from '$lib/practice'

  type Mode = 'section' | 'page'
  type LiveQuestion = Question & { _id?: string }
  type SessionState = 'idle' | 'loading' | 'active' | 'complete'

  let { mode = 'section' }: { mode?: Mode } = $props()

  const labels = ['A', 'B', 'C', 'D']
  const difficultyOptions: DifficultyFilter[] = ['Mixed', 'Easy', 'Medium', 'Hard']
  const bloomColors: Record<string, string> = {
    Knowledge: 'badge-blue',
    Comprehension: 'badge-jade',
    Application: 'badge-gold',
    Analysis: 'badge-scarlet',
  }
  const bloomLabelMap: Record<string, string> = {
    Knowledge: 'Recall Question',
    Comprehension: 'Understanding Question',
    Application: 'Practical Question',
    Analysis: 'Complex Question',
  }

  let selectedSubject = $state('Physics')
  let selectedExam = $state<ExamType>('WAEC')
  let selectedTopics = $state<string[]>([])
  let selectedDifficulty = $state<DifficultyFilter>('Mixed')
  let selectedMode = $state<PracticeMode>('practice')
  let sessionState = $state<SessionState>('idle')
  let source = $state<'convex' | 'generated' | 'fallback'>('fallback')
  let questions = $state<LiveQuestion[]>([])
  let answers = $state<(number | null)[]>([])
  let skipped = $state<boolean[]>([])
  let currentQ = $state(0)
  let sessionId = $state<string | null>(null)
  let startedAt = $state<number | null>(null)
  let questionStartedAt = $state<number | null>(null)
  let timeLeft = $state(MODE_SETTINGS.practice.secondsPerQuestion)
  let feedback = $state('')
  let showExplanation = $state(false)
  let restoreAvailable = $state(false)
  let lastSavedAt = $state<number | null>(null)
  let timerInterval: ReturnType<typeof setInterval> | null = null
  let deadline = 0

  const user = $derived($authStore)
  const signedIn = $derived(Boolean(user?.uid))
  const subjectMeta = $derived(selectedSubjectMeta(selectedSubject))
  const modeSettings = $derived(MODE_SETTINGS[selectedMode])
  const currentQuestion = $derived(questions[currentQ])
  const result = $derived(calculateBatchScore(answers, questions))
  const progress = $derived(
    questions.length ? Math.round(((currentQ + 1) / questions.length) * 100) : 0,
  )
  const answeredCount = $derived(answers.filter((a: number | null) => a !== null).length)
  const skippedCount = $derived(skipped.filter(Boolean).length)
  const grade = $derived(getWAECGrade(result.percentage))
  const timerColor = $derived(timeLeft <= 10 ? '#DC3545' : timeLeft <= 20 ? '#FF8800' : '#FFD700')
  const shellClass = $derived(
    mode === 'page' ? 'min-h-screen bg-hero pt-20' : 'bg-alt relative overflow-hidden py-24',
  )

  function cacheKey() {
    return practiceCacheKey(user?.uid, selectedMode)
  }

  function availableExams() {
    return subjectMeta.exams
  }

  function normalizeExamForSubject() {
    if (!availableExams().includes(selectedExam)) {
      selectedExam = availableExams()[0]
    }
  }

  function setSubject(subject: string) {
    selectedSubject = subject
    selectedTopics = []
    normalizeExamForSubject()
    resetIfNotActive()
  }

  function setMode(nextMode: PracticeMode) {
    selectedMode = nextMode
    timeLeft = MODE_SETTINGS[nextMode].secondsPerQuestion
    resetIfNotActive()
  }

  function setExam(examType: ExamType) {
    selectedExam = examType
    resetIfNotActive()
  }

  function setDifficulty(difficulty: DifficultyFilter) {
    selectedDifficulty = difficulty
    resetIfNotActive()
  }

  function toggleTopic(topic: string) {
    selectedTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(item => item !== topic)
      : [...selectedTopics, topic]
    resetIfNotActive()
  }

  function resetIfNotActive() {
    if (sessionState !== 'active') {
      clearDraft()
      questions = []
      answers = []
      skipped = []
      currentQ = 0
      feedback = ''
      showExplanation = false
      sessionState = 'idle'
      restoreAvailable = hasDraft()
    }
  }

  async function startPractice({ restore = false } = {}) {
    if (restore && restoreDraft()) return

    sessionState = 'loading'
    feedback = ''
    showExplanation = false
    sessionId = null
    normalizeExamForSubject()

    try {
      const liveQuestions = signedIn ? await loadConvexQuestions() : []
      if (liveQuestions.length > 0) {
        questions = randomizeQuestionBatch(liveQuestions)
        source = 'convex'
      } else {
        questions = await loadGeneratedQuestions()
        source = 'generated'
      }
    } catch {
      questions = randomizeQuestionBatch(getFallbackQuestions(selectedSubject, selectedExam))
      source = 'fallback'
    }

    answers = new Array(questions.length).fill(null)
    skipped = new Array(questions.length).fill(false)
    currentQ = 0
    startedAt = Date.now()
    questionStartedAt = Date.now()

    await startConvexSession()

    sessionState = 'active'
    startTimer()
    persistDraft()
    showToast(
      `${questions.length} ${MODE_SETTINGS[selectedMode].label} questions loaded for ${selectedExam} ${selectedSubject}`,
    )
  }

  async function startConvexSession() {
    if (!signedIn || !user?.uid) return

    try {
      const count = (await queryOnce<number>('sessions:getCount', { uid: user.uid })) ?? 0
      sessionId = await executeMutation<string>('sessions:start', {
        uid: user.uid,
        subject: selectedSubject,
        examType: selectedExam,
        mode: selectedMode,
        difficulty: selectedDifficulty,
        topics: selectedTopics,
        questionIds: questions.map((q: LiveQuestion) => q._id).filter(Boolean),
        questionCount: questions.length,
        batchNumber: count + 1,
      })
    } catch {
      sessionId = null
    }
  }

  async function loadConvexQuestions(): Promise<LiveQuestion[]> {
    await executeMutation('questions:seedPublicBank').catch(() => null)
    const batch = await queryOnce<LiveQuestion[]>('questions:getBatch', {
      subject: selectedSubject,
      examType: selectedExam,
      topics: selectedTopics,
      difficulty: selectedDifficulty,
      count: modeSettings.questionCount,
    })
    return batch ?? []
  }

  async function loadGeneratedQuestions(): Promise<LiveQuestion[]> {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: selectedSubject,
        examType: selectedExam,
        topics: selectedTopics,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        count: modeSettings.questionCount,
        uid: user?.uid,
      }),
    })
    if (!response.ok) throw new Error('Question generation failed')
    const data = await response.json()
    return randomizeQuestionBatch(data.questions ?? [])
  }

  async function selectAnswer(index: number) {
    if (!currentQuestion || answers[currentQ] !== null || skipped[currentQ]) return

    const nextAnswers = [...answers]
    nextAnswers[currentQ] = index
    answers = nextAnswers
    skipped = skipped.map((value, i) => (i === currentQ ? false : value))

    const ok = index === currentQuestion.correct
    feedback = ok
      ? 'Great work. Correct answer saved and +2 points added.'
      : `Incorrect. Correct answer: ${labels[currentQuestion.correct]} - ${currentQuestion.opts[currentQuestion.correct]}`
    showExplanation = true

    await persistCurrentAttempt(index, false, nextAnswers)
    persistDraft()
  }

  async function skipQuestion() {
    if (!currentQuestion || answers[currentQ] !== null) return
    skipped = skipped.map((value, i) => (i === currentQ ? true : value))
    feedback = 'Skipped. This question is cached and can be reviewed before finishing.'
    showExplanation = false
    await persistCurrentAttempt(null, true, answers)
    persistDraft()
  }

  async function persistCurrentAttempt(
    answer: number | null,
    wasSkipped: boolean,
    nextAnswers: (number | null)[],
  ) {
    if (!sessionId || !user?.uid || !currentQuestion) return

    const nextResult = calculateBatchScore(nextAnswers, questions)
    const timeSpent = questionStartedAt
      ? Math.max(0, Math.round((Date.now() - questionStartedAt) / 1000))
      : modeSettings.secondsPerQuestion - timeLeft

    await executeMutation('sessions:answer', {
      sessionId,
      uid: user.uid,
      questionIndex: currentQ,
      answer,
      skipped: wasSkipped,
      score: nextResult.score,
    }).catch(() => null)

    await executeMutation('sessions:saveQuestionAttempt', {
      uid: user.uid,
      sessionId,
      questionId: currentQuestion._id,
      localQuestionId: currentQuestion.id,
      questionIndex: currentQ,
      subject: selectedSubject,
      examType: selectedExam,
      mode: selectedMode,
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correct,
      isCorrect: answer !== null && answer === currentQuestion.correct,
      skipped: wasSkipped,
      scoreAwarded:
        answer !== null && answer === currentQuestion.correct ? modeSettings.pointsPerQuestion : 0,
      maxScore: modeSettings.pointsPerQuestion,
      timeSpent,
      source,
      aiRoute: 'Coordinator > Researcher > Composer > Evaluator > Scoring',
    }).catch(() => null)
  }

  function nextQuestion() {
    feedback = ''
    showExplanation = false
    if (currentQ < questions.length - 1) {
      currentQ += 1
      questionStartedAt = Date.now()
      resetTimer()
      persistDraft()
      return
    }
    completePractice()
  }

  function previousQuestion() {
    if (currentQ === 0) return
    currentQ -= 1
    questionStartedAt = Date.now()
    feedback = ''
    showExplanation = false
    resetTimer()
    persistDraft()
  }

  async function completePractice() {
    clearTimer()
    sessionState = 'complete'
    const timeTaken = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0

    if (sessionId && user?.uid) {
      await executeMutation('sessions:complete', {
        sessionId,
        uid: user.uid,
        answers,
        skipped,
        score: result.score,
        timeTaken,
      }).catch(() => null)
      await executeMutation('analytics:updateAfterSession', {
        uid: user.uid,
        sessionScore: result.score,
        totalPoints: questions.length * modeSettings.pointsPerQuestion,
        timeTaken,
        subject: selectedSubject,
      }).catch(() => null)
    }

    clearDraft()
  }

  function startTimer() {
    clearTimer()
    timeLeft = modeSettings.secondsPerQuestion
    deadline = Date.now() + modeSettings.secondsPerQuestion * 1000
    timerInterval = setInterval(updatePreciseTimer, 250)
  }

  function resetTimer() {
    if (sessionState === 'active') startTimer()
  }

  function updatePreciseTimer() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    timeLeft = remaining
    if (remaining <= 0) {
      clearTimer()
      skipQuestion().finally(nextQuestion)
    }
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function hasDraft() {
    if (!browser) return false
    const raw = localStorage.getItem(cacheKey())
    if (!raw) return false
    try {
      const draft = JSON.parse(raw) as PracticeDraft
      return draft.version === 2 && draft.questions?.length > 0
    } catch {
      return false
    }
  }

  function persistDraft() {
    if (!browser || sessionState !== 'active' || questions.length === 0) return
    const draft: PracticeDraft = {
      version: 2,
      sessionId,
      subject: selectedSubject,
      examType: selectedExam,
      topics: selectedTopics,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      questions,
      answers,
      skipped,
      currentQ,
      startedAt,
      questionStartedAt,
      timeLeft,
      source,
      savedAt: Date.now(),
    }
    localStorage.setItem(cacheKey(), JSON.stringify(draft))
    lastSavedAt = draft.savedAt
    restoreAvailable = true
  }

  function restoreDraft() {
    if (!browser) return false
    const raw = localStorage.getItem(cacheKey())
    if (!raw) return false
    try {
      const draft = JSON.parse(raw) as PracticeDraft
      selectedSubject = draft.subject
      selectedExam = draft.examType
      selectedTopics = draft.topics ?? []
      selectedDifficulty = draft.difficulty
      selectedMode = draft.mode
      questions = draft.questions
      answers = draft.answers
      skipped = draft.skipped ?? new Array(draft.questions.length).fill(false)
      currentQ = draft.currentQ
      sessionId = draft.sessionId
      startedAt = draft.startedAt
      questionStartedAt = Date.now()
      source = draft.source
      sessionState = 'active'
      feedback = 'Draft restored from local cache.'
      showExplanation = false
      startTimer()
      return true
    } catch {
      clearDraft()
      return false
    }
  }

  function clearDraft() {
    if (!browser) return
    localStorage.removeItem(cacheKey())
    restoreAvailable = false
    lastSavedAt = null
  }

  function getFallbackQuestions(subject: string, examType: ExamType): LiveQuestion[] {
    return [
      {
        id: `${subject}-${examType}-fallback-1`,
        q: `${examType} ${subject}: Which option best matches the selected syllabus objective?`,
        opts: [
          'A curriculum-grounded concept',
          'A random unrelated fact',
          'An unsupported opinion',
          'A current event guess',
        ],
        correct: 0,
        bloom: 'Comprehension',
        exp: 'SchoolCBT fallback questions stay tied to the selected subject and exam type.',
        subject,
        topic: selectedTopics[0] ?? subjectMeta.topics[0],
        examType,
        difficulty: selectedDifficulty === 'Mixed' ? 'Easy' : selectedDifficulty,
      },
      {
        id: `${subject}-${examType}-fallback-2`,
        q: `In a ${MODE_SETTINGS[selectedMode].label}, how should answers be evaluated?`,
        opts: [
          'By the selected answer against the correct keyed option',
          'By the order the buttons appear only',
          'By the student name',
          'By the page refresh count',
        ],
        correct: 0,
        bloom: 'Application',
        exp: 'Scores are awarded by matching the selected answer to the correct answer key.',
        subject,
        topic: selectedTopics[0] ?? subjectMeta.topics[0],
        examType,
        difficulty: selectedDifficulty === 'Mixed' ? 'Medium' : selectedDifficulty,
      },
    ]
  }

  onMount(() => {
    normalizeExamForSubject()
    restoreAvailable = hasDraft()
    if (mode === 'section') startPractice({ restore: true })
  })

  onDestroy(clearTimer)
</script>

<section id="cbt-demo" class={shellClass}>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-10 text-center">
      <div class="sec-badge">CBT Live Center</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">
        Real-Time <span class="text-gold">AI-Agent</span> CBT Practice
      </h2>
      <p class="mx-auto max-w-2xl text-white/50">
        Subject-aware generation, randomized options, precise timing, cached drafts, live scoring,
        and Convex-backed attempts for authenticated students.
      </p>
    </div>

    <div class="grid gap-8 lg:grid-cols-5">
      <aside class="space-y-4 lg:col-span-2">
        <div class="glass-card p-5">
          <h3 class="mb-4 text-sm font-semibold text-white">Exam Routing</h3>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label class="block">
              <span class="mb-1 block text-xs text-white/45">Subject</span>
              <select
                value={selectedSubject}
                onchange={e => setSubject(e.currentTarget.value)}
                class="w-full rounded-xl border border-white/10 bg-cobalt/50 px-3 py-3 text-sm text-white"
              >
                {#each SUBJECT_OPTIONS as item}
                  <option value={item.subject}>{item.subject}</option>
                {/each}
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs text-white/45">Exam type</span>
              <select
                value={selectedExam}
                onchange={e => setExam(e.currentTarget.value as ExamType)}
                class="w-full rounded-xl border border-white/10 bg-cobalt/50 px-3 py-3 text-sm text-white"
              >
                {#each availableExams() as exam}
                  <option value={exam}>{exam}</option>
                {/each}
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs text-white/45">Difficulty</span>
              <select
                value={selectedDifficulty}
                onchange={e => setDifficulty(e.currentTarget.value as DifficultyFilter)}
                class="w-full rounded-xl border border-white/10 bg-cobalt/50 px-3 py-3 text-sm text-white"
              >
                {#each difficultyOptions as difficulty}
                  <option value={difficulty}>{difficulty}</option>
                {/each}
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs text-white/45">CBT mode</span>
              <select
                value={selectedMode}
                onchange={e => setMode(e.currentTarget.value as PracticeMode)}
                class="w-full rounded-xl border border-white/10 bg-cobalt/50 px-3 py-3 text-sm text-white"
              >
                {#each Object.entries(MODE_SETTINGS) as [key, item]}
                  <option value={key}>{item.label} · {item.questionCount} questions</option>
                {/each}
              </select>
            </label>
          </div>

          <div class="mt-5">
            <div class="mb-2 text-xs text-white/45">Topic focus</div>
            <div class="flex flex-wrap gap-2">
              {#each subjectMeta.topics as topic}
                <button
                  onclick={() => toggleTopic(topic)}
                  class="rounded-lg border px-3 py-2 text-xs transition {selectedTopics.includes(
                    topic,
                  )
                    ? 'border-gold/40 bg-gold/12 text-gold'
                    : 'border-white/10 bg-cobalt/30 text-white/55 hover:border-gold/25'}"
                >
                  {topic}
                </button>
              {/each}
            </div>
          </div>

          <div class="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              onclick={() => startPractice()}
              disabled={sessionState === 'loading'}
              class="btn-gold py-3 text-sm"
            >
              {sessionState === 'loading'
                ? 'Generating...'
                : sessionState === 'active'
                  ? 'Regenerate Batch'
                  : 'Start Live Batch'}
            </button>
            <button
              onclick={() => startPractice({ restore: true })}
              disabled={!restoreAvailable}
              class="btn-outline py-3 text-sm {restoreAvailable ? '' : 'opacity-40'}"
            >
              Restore Draft
            </button>
          </div>
          {#if !signedIn}
            <button
              onclick={() => showModal('signup')}
              class="btn-outline mt-3 w-full py-3 text-sm"
            >
              Sign up to save attempts to Convex
            </button>
          {/if}
        </div>

        <div class="glass-card p-5">
          <div class="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Live Counters
          </div>
          <div class="grid grid-cols-4 gap-3 text-center">
            <div>
              <div class="font-sora text-xl font-bold text-jade">{result.correct}</div>
              <div class="text-[10px] text-white/35">Correct</div>
            </div>
            <div>
              <div class="font-sora text-xl font-bold text-scarlet">{result.wrong}</div>
              <div class="text-[10px] text-white/35">Wrong</div>
            </div>
            <div>
              <div class="font-sora text-xl font-bold text-gold">{result.score}</div>
              <div class="text-[10px] text-white/35">Points</div>
            </div>
            <div>
              <div class="font-sora text-xl font-bold text-white/60">{skippedCount}</div>
              <div class="text-[10px] text-white/35">Skipped</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="mb-1 flex justify-between text-xs">
              <span class="text-white/40">Answered</span>
              <span class="text-white/60">{answeredCount}/{questions.length}</span>
            </div>
            <div class="pbar">
              <div
                class="pfill bg-gradient-to-r from-jade to-gold"
                style="width:{questions.length ? (answeredCount / questions.length) * 100 : 0}%"
              ></div>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="badge {source === 'convex' ? 'badge-jade' : 'badge-blue'}">
              {source === 'convex'
                ? 'Convex live'
                : source === 'generated'
                  ? 'AI routed'
                  : 'Fallback'}
            </span>
            <span class="badge badge-gold">
              {signedIn ? 'Attempt persistence on' : 'Local cache only'}
            </span>
            <span class="badge badge-blue">Autosave {lastSavedAt ? 'ready' : 'standby'}</span>
          </div>
        </div>
      </aside>

      <div class="lg:col-span-3">
        {#if sessionState === 'idle'}
          <div class="glass-card p-12 text-center">
            <div class="mb-4 text-5xl">🎯</div>
            <h3 class="font-sora mb-2 text-xl font-bold text-white">
              Build a live {MODE_SETTINGS[selectedMode].label} batch
            </h3>
            <p class="mx-auto mb-6 max-w-sm text-sm text-white/45">
              Select subject, exam type, difficulty, and topic focus. The AI route generates and
              scores against those preferences while caching your draft locally.
            </p>
            <button onclick={() => startPractice()} class="btn-gold px-8 py-3 text-sm">
              Start Practice
            </button>
          </div>
        {:else if sessionState === 'complete'}
          <div class="glass-card p-8 text-center">
            <div class="font-sora mb-2 text-5xl font-extrabold text-gold">{result.percentage}%</div>
            <h3 class="font-sora mb-1 text-2xl font-bold text-white">{grade.label}</h3>
            <p class="mx-auto mb-6 max-w-lg text-sm text-white/55">
              {grade.description}. You scored {result.score}/{questions.length *
                modeSettings.pointsPerQuestion}
              points in {MODE_SETTINGS[selectedMode].label}.
            </p>
            <div class="mb-6 grid gap-4 sm:grid-cols-4">
              <div class="rounded-xl bg-cobalt/30 p-4">
                <div class="font-sora text-2xl font-bold text-jade">{result.correct}</div>
                <div class="text-xs text-white/45">Correct</div>
              </div>
              <div class="rounded-xl bg-cobalt/30 p-4">
                <div class="font-sora text-2xl font-bold text-scarlet">{result.wrong}</div>
                <div class="text-xs text-white/45">Wrong</div>
              </div>
              <div class="rounded-xl bg-cobalt/30 p-4">
                <div class="font-sora text-2xl font-bold text-white/60">{result.unanswered}</div>
                <div class="text-xs text-white/45">Unanswered</div>
              </div>
              <div class="rounded-xl bg-cobalt/30 p-4">
                <div class="font-sora text-2xl font-bold text-gold">{skippedCount}</div>
                <div class="text-xs text-white/45">Skipped</div>
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
              <button onclick={() => startPractice()} class="btn-gold px-6 py-2.5 text-sm">
                New Batch
              </button>
              <a href="/dashboard" class="btn-outline px-6 py-2.5 text-sm">View Dashboard</a>
            </div>
          </div>
        {:else if currentQuestion}
          <div class="glass-card overflow-hidden">
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-white/06 px-5 py-4"
            >
              <div>
                <div class="mb-0.5 font-mono text-xs text-white/35">SCHOOLCBT LIVE CENTER</div>
                <div class="text-sm font-semibold text-white" data-testid="active-practice-context">
                  {selectedExam}
                  {selectedSubject} · {MODE_SETTINGS[selectedMode].label} · {selectedDifficulty}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="timer-ring">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="rgba(255,255,255,0.08)"
                      stroke-width="3"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke={timerColor}
                      stroke-width="3"
                      fill="none"
                      stroke-linecap="round"
                      stroke-dasharray="113"
                      stroke-dashoffset={113 - (113 * timeLeft) / modeSettings.secondsPerQuestion}
                    />
                  </svg>
                  <span class="absolute font-mono text-[0.65rem] font-bold text-white">
                    {timeLeft}
                  </span>
                </div>
                <span class="badge badge-gold font-mono">{result.score} pts</span>
              </div>
            </div>

            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-white/05 px-5 py-3"
            >
              <div class="flex flex-wrap gap-1.5">
                {#each questions as question, i}
                  <button
                    onclick={() => {
                      currentQ = i
                      questionStartedAt = Date.now()
                      feedback = ''
                      showExplanation = false
                      resetTimer()
                      persistDraft()
                    }}
                    class="h-7 w-7 rounded-lg border text-xs font-bold {i === currentQ
                      ? 'border-gold bg-cobalt text-gold'
                      : skipped[i]
                        ? 'border-gold/40 bg-gold/10 text-gold'
                        : answers[i] === null
                          ? 'border-white/10 bg-cobalt/20 text-white/35'
                          : answers[i] === question.correct
                            ? 'border-jade bg-jade/20 text-jade'
                            : 'border-scarlet bg-scarlet/20 text-scarlet'}"
                  >
                    {i + 1}
                  </button>
                {/each}
              </div>
              <span class="text-xs text-white/35">Q {currentQ + 1} of {questions.length}</span>
            </div>

            <div class="px-5 pt-3">
              <div class="pbar">
                <div
                  class="pfill bg-gradient-to-r from-gold to-gold/60"
                  style="width:{progress}%"
                ></div>
              </div>
            </div>

            <div class="p-5">
              {#if feedback}
                <div
                  class="mb-4 rounded-xl border border-white/10 bg-cobalt/30 p-4 text-sm text-white/75"
                >
                  {feedback}
                </div>
              {/if}
              <div class="mb-5 rounded-xl border border-white/05 bg-white/2 p-5">
                <div class="flex flex-wrap items-start gap-3">
                  <span
                    class="badge {bloomColors[currentQuestion.bloom] ??
                      'badge-blue'} mt-0.5 shrink-0"
                  >
                    {bloomLabelMap[currentQuestion.bloom] ?? currentQuestion.bloom}
                  </span>
                  <span class="badge badge-blue mt-0.5 shrink-0">{currentQuestion.topic}</span>
                  <p class="min-w-0 flex-1 text-sm leading-relaxed text-white/85">
                    {currentQuestion.q}
                  </p>
                </div>
              </div>
              <div class="mb-5 space-y-2.5">
                {#each currentQuestion.opts as option, i}
                  {@const isAnswered = answers[currentQ] !== null || skipped[currentQ]}
                  {@const isCorrect = isAnswered && i === currentQuestion.correct}
                  {@const isWrongPick =
                    answers[currentQ] !== null &&
                    i === answers[currentQ] &&
                    i !== currentQuestion.correct}
                  <button
                    onclick={() => selectAnswer(i)}
                    disabled={isAnswered}
                    class="opt-btn flex min-h-[44px] w-full items-center gap-3 p-3.5 text-left {isCorrect
                      ? 'correct'
                      : ''} {isWrongPick ? 'wrong' : ''}"
                  >
                    <span
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cobalt/60 text-xs font-bold text-gold"
                    >
                      {labels[i]}
                    </span>
                    <span class="flex-1 text-sm text-white/80">{option}</span>
                  </button>
                {/each}
              </div>
              {#if showExplanation}
                <div class="mb-5 rounded-xl border border-jade/18 bg-jade/6 p-4">
                  <div class="mb-2 text-xs font-semibold text-jade">AI Evaluator Explanation</div>
                  <p class="text-sm leading-relaxed text-white/65">{currentQuestion.exp}</p>
                </div>
              {/if}
              <div class="flex flex-wrap items-center justify-between gap-3">
                <button
                  onclick={previousQuestion}
                  disabled={currentQ === 0}
                  class="btn-ghost px-4 py-2 text-sm {currentQ === 0 ? 'opacity-40' : ''}"
                >
                  Previous
                </button>
                <div class="flex gap-2">
                  <button
                    onclick={skipQuestion}
                    disabled={answers[currentQ] !== null || skipped[currentQ]}
                    class="btn-outline px-4 py-2 text-sm"
                  >
                    Skip
                  </button>
                  <button onclick={nextQuestion} class="btn-primary px-5 py-2 text-sm">
                    {currentQ === questions.length - 1 ? 'Finish Batch' : 'Next Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
