<!-- src/routes/practice/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { cbtStore, showToast, authStore } from '$lib/stores';
  import type { Question } from '$lib/stores';

  // ── State ─────────────────────────────────────────────────
  let subject       = $state('Physics');
  let examType      = $state('WAEC');
  let generating    = $state(false);
  let sessionActive = $state(false);
  let questions     = $state<Question[]>([]);
  let answers       = $state<(number | null)[]>([]);
  let currentQ      = $state(0);
  let score         = $state(0);
  let timeLeft      = $state(50);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let batchComplete = $state(false);
  let feedbackMsg   = $state('');
  let feedbackType  = $state<'correct' | 'wrong' | ''>('');
  let showExplain   = $state(false);
  let correctCount  = $state(0);
  let wrongCount    = $state(0);

  const subjects = [
    { name: 'Physics',       icon: '⚛️', exam: 'WAEC' },
    { name: 'Mathematics',   icon: '📐', exam: 'JAMB' },
    { name: 'English',       icon: '📝', exam: 'WAEC' },
    { name: 'Chemistry',     icon: '🧪', exam: 'NECO' },
    { name: 'Biology',       icon: '🧬', exam: 'JAMB' },
    { name: 'Economics',     icon: '📊', exam: 'WAEC' },
    { name: 'Government',    icon: '🏛️', exam: 'JAMB' },
    { name: 'Geography',     icon: '🌍', exam: 'WAEC' }
  ];

  const bloomColors: Record<string, string> = {
    Knowledge:    'badge-blue',
    Comprehension:'badge-jade',
    Application:  'badge-gold',
    Analysis:     'badge-scarlet'
  };

  const labels = ['A', 'B', 'C', 'D'];

  // ── Computed ──────────────────────────────────────────────
  let currentQuestion = $derived(questions[currentQ]);
  let progress        = $derived(questions.length ? Math.round((currentQ / questions.length) * 100) : 0);
  let timerPct        = $derived((timeLeft / 50) * 100);
  let timerColor      = $derived(timeLeft <= 10 ? '#DC3545' : timeLeft <= 20 ? '#FF8800' : '#FFD700');
  let circumference   = 113; // 2π × 18

  // ── Generate Questions ────────────────────────────────────
  async function generateQuestions() {
    generating = true;
    feedbackMsg = '';
    feedbackType = '';
    batchComplete = false;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, examType, count: 5 })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      questions    = data.questions;
      answers      = new Array(questions.length).fill(null);
      currentQ     = 0;
      score        = 0;
      correctCount = 0;
      wrongCount   = 0;
      sessionActive = true;

      startTimer();
      showToast(`🤖 ${questions.length} questions generated for ${subject}!`);
    } catch (e) {
      showToast('⚠️ Using cached questions — AI service loading');
      // Use a minimal fallback
      questions = getFallbackQuestions(subject);
      answers   = new Array(questions.length).fill(null);
      currentQ  = 0;
      score     = 0;
      correctCount = 0;
      wrongCount   = 0;
      sessionActive = true;
      startTimer();
    } finally {
      generating = false;
    }
  }

  // ── Answer ────────────────────────────────────────────────
  function selectAnswer(i: number) {
    if (answers[currentQ] !== null || !currentQuestion) return;
    answers[currentQ] = i;
    const ok = i === currentQuestion.correct;
    if (ok) { score += 2; correctCount++; }
    else    { wrongCount++; }
    feedbackType = ok ? 'correct' : 'wrong';
    feedbackMsg  = ok
      ? '✅ Correct! +2 points'
      : `❌ Wrong. Answer: ${labels[currentQuestion.correct]} — ${currentQuestion.opts[currentQuestion.correct]}`;
    showExplain = true;
    resetTimer();
  }

  // ── Navigation ────────────────────────────────────────────
  function nextQ() {
    showExplain  = false;
    feedbackMsg  = '';
    feedbackType = '';
    if (currentQ < questions.length - 1) {
      currentQ++;
      resetTimer();
    } else {
      completeBatch();
    }
  }

  function prevQ() {
    if (currentQ > 0) {
      currentQ--;
      showExplain  = false;
      feedbackMsg  = '';
      feedbackType = '';
    }
  }

  function jumpTo(i: number) {
    currentQ     = i;
    feedbackMsg  = '';
    feedbackType = '';
    showExplain  = false;
  }

  function completeBatch() {
    clearTimer();
    batchComplete = true;
    sessionActive = false;
  }

  function restartBatch() {
    batchComplete = false;
    answers      = new Array(questions.length).fill(null);
    currentQ     = 0;
    score        = 0;
    correctCount = 0;
    wrongCount   = 0;
    sessionActive = true;
    startTimer();
  }

  // ── Timer ─────────────────────────────────────────────────
  function startTimer() {
    clearTimer();
    timeLeft = 50;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (answers[currentQ] === null) answers[currentQ] = -1;
        clearTimer();
        setTimeout(nextQ, 300);
      }
    }, 1000);
  }

  function resetTimer() { clearTimer(); startTimer(); }

  function clearTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  // ── Batch results ─────────────────────────────────────────
  let batchPct    = $derived(questions.length ? Math.round((score / (questions.length * 2)) * 100) : 0);
  let waecGrade   = $derived(getWAECGrade(batchPct));
  let aiAnalysis  = $derived(getAIAnalysis(batchPct, subject));

  function getWAECGrade(pct: number): string {
    if (pct >= 75) return 'A1 — Excellent';
    if (pct >= 70) return 'B2 — Very Good';
    if (pct >= 65) return 'B3 — Good';
    if (pct >= 60) return 'C4 — Credit';
    if (pct >= 55) return 'C5 — Credit';
    if (pct >= 50) return 'C6 — Credit';
    if (pct >= 45) return 'D7 — Pass';
    if (pct >= 40) return 'E8 — Pass';
    return 'F9 — Fail';
  }

  function getAIAnalysis(pct: number, subj: string): string {
    if (pct >= 80) return `Outstanding! Your ${subj} score is well above the pass threshold. Maintain consistency across all topics and aim for 90%+ in your next batch.`;
    if (pct >= 65) return `Good progress in ${subj}. You're above the pass mark. Review topics where you lost points to push above 80% — the AI study plan has been updated with recommended focus areas.`;
    return `Keep practicing ${subj}. Review the topics you missed and revisit curriculum fundamentals. Your AI study plan has highlighted 3 priority areas for immediate review.`;
  }

  // ── Fallback questions ────────────────────────────────────
  function getFallbackQuestions(subj: string): Question[] {
    const bank: Record<string, Question[]> = {
      Physics: [
        { id:'p1', q:"What is the SI unit of force?", opts:["Joule","Watt","Newton","Pascal"], correct:2, bloom:"Knowledge", exp:"The Newton (N) is the SI unit of force: 1 N = 1 kg·m/s².", subject:"Physics", topic:"Mechanics", examType:"WAEC" as const, difficulty:"Easy" as const },
        { id:'p2', q:"Speed of light in vacuum ≈", opts:["3×10⁶ m/s","3×10⁸ m/s","3×10¹⁰ m/s","3×10⁴ m/s"], correct:1, bloom:"Knowledge", exp:"c ≈ 3×10⁸ m/s (299,792,458 m/s exactly).", subject:"Physics", topic:"Waves", examType:"WAEC" as const, difficulty:"Easy" as const },
        { id:'p3', q:"Work done = Force × ?", opts:["Time","Mass","Distance","Velocity"], correct:2, bloom:"Knowledge", exp:"W = F·d (Work = Force × displacement in direction of force).", subject:"Physics", topic:"Energy", examType:"WAEC" as const, difficulty:"Easy" as const },
        { id:'p4', q:"Ohm's Law: V =", opts:["I/R","IR","I+R","I²R"], correct:1, bloom:"Application", exp:"Ohm's Law: Voltage = Current × Resistance (V = IR).", subject:"Physics", topic:"Electricity", examType:"WAEC" as const, difficulty:"Easy" as const },
        { id:'p5', q:"Density = Mass ÷ ?", opts:["Weight","Pressure","Volume","Force"], correct:2, bloom:"Knowledge", exp:"Density (ρ) = mass (m) ÷ volume (V). Unit: kg/m³.", subject:"Physics", topic:"Properties of Matter", examType:"WAEC" as const, difficulty:"Easy" as const }
      ]
    };
    return bank[subj] ?? bank['Physics'];
  }

  // ── Lifecycle ─────────────────────────────────────────────
  onDestroy(() => clearTimer());

  // ── Dashboard stats from Svelte 5 store ──────────────────
  let storeState = $derived($cbtStore);
</script>

<svelte:head>
  <title>CBT Practice — SchoolCBT</title>
  <meta name="description" content="Practice JAMB, WAEC, NECO questions with AI-generated batches, live timer, and instant feedback on SchoolCBT." />
  <meta name="keywords" content="CBT practice, JAMB CBT, WAEC practice test, NECO exam questions, AI exam simulator Nigeria, free CBT test" />
  <meta property="og:title" content="CBT Practice — SchoolCBT" />
  <meta property="og:description" content="Practice JAMB, WAEC, NECO questions with AI-generated batches, live timer, and instant feedback." />
  <meta property="og:url" content="https://schoolcbt.ewinproject.org/practice" />
  <meta property="og:image" content="https://schoolcbt.ewinproject.org/og-image.png" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://schoolcbt.ewinproject.org/practice" />
</svelte:head>

<!-- Full Practice Page -->
<main class="min-h-screen bg-hero pt-20">
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

    <!-- Header -->
    <div class="mb-10 text-center">
      <div class="sec-badge">Live CBT Practice</div>
      <h1 class="font-sora mt-3 mb-3 text-4xl font-bold text-white">
        AI-Powered <span class="shimmer-text">Practice Engine</span>
      </h1>
      <p class="mx-auto max-w-xl text-white/50">
        Select your subject, generate AI questions, and practice with a real 50-second timer. 
        Get instant feedback and WAEC-grade scoring after each batch.
      </p>
    </div>

    <div class="grid gap-8 lg:grid-cols-5">
      <!-- LEFT: Subject Selector -->
      <div class="lg:col-span-2 space-y-4">
        <div class="glass-card p-5">
          <h3 class="mb-4 text-sm font-semibold text-white">Select Subject &amp; Exam</h3>

          <div class="mb-4 space-y-2">
            {#each subjects as s}
              <button
                onclick={() => { subject = s.name; examType = s.exam; }}
                class="w-full text-left rounded-xl p-3 flex items-center gap-3 border transition-all
                       {subject === s.name
                         ? 'border-gold/30 bg-cobalt/40'
                         : 'border-white/07 bg-cobalt/20 hover:border-gold/20'}"
              >
                <span class="text-lg">{s.icon}</span>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-white">{s.name}</div>
                  <div class="text-xs text-white/40">{s.exam}</div>
                </div>
                {#if subject === s.name}
                  <span class="badge badge-gold">Active</span>
                {/if}
              </button>
            {/each}
          </div>

          <button
            onclick={generateQuestions}
            disabled={generating}
            class="btn-gold w-full py-3 text-sm {generating ? 'opacity-70 cursor-not-allowed' : ''}"
          >
            {#if generating}
              <span class="animate-spin inline-block mr-2">⟳</span>Generating...
            {:else}
              🤖 Generate AI Questions
            {/if}
          </button>
        </div>

        <!-- Session Stats -->
        <div class="glass-card p-5">
          <div class="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40">Session Stats</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="text-center">
              <div class="font-sora text-xl font-bold text-jade">{correctCount}</div>
              <div class="text-[10px] text-white/35 mt-0.5">Correct</div>
            </div>
            <div class="text-center">
              <div class="font-sora text-xl font-bold text-scarlet">{wrongCount}</div>
              <div class="text-[10px] text-white/35 mt-0.5">Wrong</div>
            </div>
            <div class="text-center">
              <div class="font-sora text-xl font-bold text-gold">{score}</div>
              <div class="text-[10px] text-white/35 mt-0.5">Points</div>
            </div>
          </div>
          {#if questions.length > 0}
            <div class="mt-3">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-white/40">Progress</span>
                <span class="text-white/60">{progress}%</span>
              </div>
              <div class="pbar"><div class="pfill bg-gradient-to-r from-jade to-jade/50" style="width:{progress}%"></div></div>
            </div>
          {/if}
        </div>
      </div>

      <!-- RIGHT: CBT Panel -->
      <div class="lg:col-span-3">
        {#if !sessionActive && !batchComplete && questions.length === 0}
          <!-- Empty State -->
          <div class="glass-card p-12 text-center">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="font-sora text-xl font-bold text-white mb-2">Ready to Practice?</h3>
            <p class="text-white/45 text-sm mb-6 max-w-sm mx-auto">
              Select a subject on the left and click "Generate AI Questions" to start your personalized practice session.
            </p>
            <button onclick={generateQuestions} class="btn-gold px-8 py-3 text-sm">
              🤖 Start Practice Now
            </button>
          </div>

        {:else if batchComplete}
          <!-- Batch Complete Report -->
          <div class="glass-card p-8">
            <div class="text-center mb-8">
              <div class="text-6xl mb-3">{batchPct >= 75 ? '🏆' : batchPct >= 50 ? '📊' : '📚'}</div>
              <h2 class="font-sora text-2xl font-bold text-white mb-2">Batch Complete!</h2>
              <div class="font-sora text-gold text-5xl font-extrabold mb-1">{batchPct}%</div>
              <div class="text-white/60 text-lg">{waecGrade}</div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-cobalt/30 rounded-xl p-4 text-center">
                <div class="font-sora text-jade text-2xl font-bold">{correctCount}</div>
                <div class="text-xs text-white/45 mt-1">Correct</div>
              </div>
              <div class="bg-cobalt/30 rounded-xl p-4 text-center">
                <div class="font-sora text-scarlet text-2xl font-bold">{wrongCount}</div>
                <div class="text-xs text-white/45 mt-1">Wrong</div>
              </div>
              <div class="bg-cobalt/30 rounded-xl p-4 text-center">
                <div class="font-sora text-white/60 text-2xl font-bold">{questions.length - correctCount - wrongCount}</div>
                <div class="text-xs text-white/45 mt-1">Skipped</div>
              </div>
            </div>

            <div class="bg-cobalt/30 rounded-xl p-4 mb-6">
              <div class="text-gold text-xs font-semibold mb-2">🤖 AI Performance Analysis</div>
              <p class="text-sm text-white/60 leading-relaxed">{aiAnalysis}</p>
            </div>

            <div class="flex flex-wrap gap-3 justify-center">
              <button onclick={restartBatch} class="btn-gold px-6 py-2.5 text-sm">Try Again 🔄</button>
              <button onclick={generateQuestions} class="btn-primary px-6 py-2.5 text-sm">New Questions 🤖</button>
              <a href="/dashboard" class="btn-outline px-6 py-2.5 text-sm">View Dashboard →</a>
            </div>
          </div>

        {:else if sessionActive && currentQuestion}
          <!-- Active CBT Interface -->
          <div class="glass-card overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-white/06 px-5 py-4">
              <div>
                <div class="text-xs font-mono text-white/35 mb-0.5">SCHOOLCBT PRACTICE</div>
                <div class="text-sm font-semibold text-white">{subject} · {examType}</div>
              </div>
              <div class="flex items-center gap-3">
                <!-- Timer Ring -->
                <div class="timer-ring {timeLeft <= 10 ? 'timer-urgent' : ''}">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"/>
                    <circle
                      cx="22" cy="22" r="18"
                      stroke={timerColor}
                      stroke-width="3"
                      fill="none"
                      stroke-linecap="round"
                      stroke-dasharray={circumference}
                      stroke-dashoffset={circumference - (circumference * timeLeft / 50)}
                      style="transition: stroke-dashoffset 1s linear, stroke 0.3s"
                    />
                  </svg>
                  <span class="absolute font-mono font-bold text-white" style="font-size:.65rem">{timeLeft}</span>
                </div>
                <span class="badge badge-gold font-mono">{score} pts</span>
              </div>
            </div>

            <!-- Q Nav -->
            <div class="flex items-center justify-between gap-3 border-b border-white/05 px-5 py-3">
              <div class="flex gap-1.5">
                {#each questions as _, i}
                  <button
                    onclick={() => jumpTo(i)}
                    class="w-7 h-7 rounded-lg text-xs font-bold border transition-all
                           {i === currentQ
                             ? 'border-gold bg-cobalt text-gold'
                             : answers[i] !== null
                               ? answers[i] === questions[i].correct
                                 ? 'border-jade bg-jade/20 text-jade'
                                 : 'border-scarlet bg-scarlet/20 text-scarlet'
                               : 'border-white/10 bg-cobalt/20 text-white/30'}"
                  >{i + 1}</button>
                {/each}
              </div>
              <span class="text-xs text-white/35">Q {currentQ + 1} of {questions.length}</span>
            </div>

            <!-- Progress -->
            <div class="px-5 pt-3">
              <div class="pbar">
                <div class="pfill bg-gradient-to-r from-gold to-gold/60" style="width:{progress + 2}%"></div>
              </div>
            </div>

            <!-- Body -->
            <div class="p-5">
              <!-- Feedback -->
              {#if feedbackMsg}
                <div class="mb-4 rounded-xl p-4 text-sm font-medium
                            {feedbackType === 'correct'
                              ? 'bg-jade/10 border border-jade/20 text-jade'
                              : 'bg-scarlet/10 border border-scarlet/20 text-scarlet'}">
                  {feedbackMsg}
                </div>
              {/if}

              <!-- Question -->
              <div class="border border-white/05 rounded-xl p-5 mb-5">
                <div class="flex items-start gap-3">
                  <span class="badge {bloomColors[currentQuestion.bloom] ?? 'badge-blue'} mt-0.5 shrink-0">
                    {currentQuestion.bloom}
                  </span>
                  <p class="text-sm leading-relaxed text-white/85">{currentQuestion.q}</p>
                </div>
              </div>

              <!-- Options -->
              <div class="mb-5 space-y-2.5">
                {#each currentQuestion.opts as opt, i}
                  {@const isAnswered   = answers[currentQ] !== null}
                  {@const isCorrect    = isAnswered && i === currentQuestion.correct}
                  {@const isWrongPick  = isAnswered && i === answers[currentQ] && i !== currentQuestion.correct}
                  <button
                    onclick={() => selectAnswer(i)}
                    disabled={isAnswered}
                    class="opt-btn w-full flex items-center gap-3 p-3.5 text-left min-h-[44px]                           {isAnswered ? 'answered' : ''}
                           {isCorrect  ? 'correct'  : ''}
                           {isWrongPick ? 'wrong'   : ''}"
                  >
                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-cobalt/60 text-xs font-bold text-gold shrink-0">
                      {labels[i]}
                    </span>
                    <span class="text-sm text-white/80 flex-1">{opt}</span>
                    {#if isCorrect}  <span>✅</span>
                    {:else if isWrongPick} <span>❌</span>
                    {/if}
                  </button>
                {/each}
              </div>

              <!-- Explanation -->
              {#if showExplain && currentQuestion.exp}
                <div class="mb-5 rounded-xl border border-jade/18 bg-jade/6 p-4">
                  <div class="text-jade mb-2 text-xs font-semibold">💡 Explanation</div>
                  <p class="text-sm leading-relaxed text-white/65">{currentQuestion.exp}</p>
                </div>
              {/if}

              <!-- Navigation -->
              <div class="flex items-center justify-between gap-3">
                <button onclick={prevQ} disabled={currentQ === 0}
                  class="btn-ghost flex items-center gap-2 px-4 py-2 text-sm {currentQ === 0 ? 'opacity-40' : ''}">
                  ← Previous
                </button>
                <button onclick={nextQ} class="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
                  {currentQ === questions.length - 1 ? 'Finish Batch' : 'Next Question'} →
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
