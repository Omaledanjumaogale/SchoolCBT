<script lang="ts">
  let { onSignup }: { onSignup: () => void } = $props();

  const labels = ['A', 'B', 'C', 'D'];
  let score = $state(0);
  let timeLeft = $state(50);
  let currentQ = $state(0);
  let answered = $state<(number | null)[]>(new Array(5).fill(null));
  let feedback = $state('');
  let feedbackOk = $state(false);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const questions = [
    { q: "A body of mass 5 kg accelerates at 2 m/s². Net force =", opts: ["5 N", "10 N", "15 N", "20 N"], correct: 1, bloom: "Application" },
    { q: "Which is NOT a vector quantity?", opts: ["Velocity", "Force", "Speed", "Displacement"], correct: 2, bloom: "Knowledge" },
    { q: "Conservation of momentum states:", opts: ["Total energy is constant", "Momentum before = after", "F=ma", "Work = Force × Distance"], correct: 1, bloom: "Comprehension" },
    { q: "Wave frequency 5 Hz, wavelength 2 m. Speed =", opts: ["5 m/s", "2 m/s", "10 m/s", "0.4 m/s"], correct: 2, bloom: "Application" },
    { q: "SI unit of electric charge:", opts: ["Ampere", "Watt", "Coulomb", "Volt"], correct: 2, bloom: "Knowledge" }
  ];

  const q = $derived(questions[currentQ]);
  const progress = $derived(Math.round((currentQ / questions.length) * 100));
  const timerColor = $derived(timeLeft <= 10 ? '#DC3545' : '#FFD700');

  function selectAnswer(i: number) {
    if (answered[currentQ] !== null || !q) return;
    const newA = [...answered]; newA[currentQ] = i; answered = newA;
    const ok = i === q.correct;
    if (ok) score += 2;
    feedback = ok ? '✅ Correct! +2 pts' : `❌ Wrong. ${labels[q.correct]}: ${q.opts[q.correct]}`;
    feedbackOk = ok;
    resetTimer();
  }

  function nextQ() {
    feedback = '';
    if (currentQ < questions.length - 1) { currentQ++; resetTimer(); }
    else { clearTimerInterval(); feedback = `🎉 Done! Score: ${score}/${questions.length * 2}`; }
  }

  function prevQ() { if (currentQ > 0) { currentQ--; feedback = ''; } }

  function startTimer() {
    clearTimerInterval();
    timeLeft = 50;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (answered[currentQ] === null) { const a = [...answered]; a[currentQ] = -1; answered = a; }
        clearTimerInterval(); setTimeout(nextQ, 300);
      }
    }, 1000);
  }

  function resetTimer() { clearTimerInterval(); startTimer(); }
  function clearTimerInterval() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

  import { onMount } from 'svelte';
  onMount(() => {
    startTimer();
    return () => clearTimerInterval();
  });
</script>

<div class="glass-card overflow-hidden" style="border-color:rgba(255,215,0,0.2)">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-white/06 px-5 py-3.5">
    <div class="flex items-center gap-2.5">
      <div class="flex gap-1.5">
        <div class="h-3 w-3 rounded-full bg-scarlet/70"></div>
        <div class="h-3 w-3 rounded-full bg-gold/70"></div>
        <div class="h-3 w-3 rounded-full bg-jade/70"></div>
      </div>
      <span class="font-mono text-xs text-white/40">SchoolCBT · Physics WAEC</span>
    </div>
    <span class="badge badge-gold font-mono">{score} pts</span>
  </div>

  <!-- Timer + Progress -->
  <div class="flex items-center justify-between gap-3 border-b border-white/05 px-5 py-3">
    <div class="flex items-center gap-2.5">
      <div class="timer-ring">
        <svg width="38" height="38" viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="15" stroke="rgba(255,255,255,0.08)" stroke-width="2.5" fill="none"/>
          <circle cx="19" cy="19" r="15" stroke={timerColor} stroke-width="2.5" fill="none"
            stroke-linecap="round" stroke-dasharray="94"
            stroke-dashoffset={94 - (94 * timeLeft / 50)}
            style="transition: stroke-dashoffset 1s linear, stroke 0.3s" />
        </svg>
        <span class="absolute font-mono font-bold text-white" style="font-size:.6rem">{timeLeft}</span>
      </div>
      <div>
        <div class="font-mono text-[10px] text-white/35">TIME LEFT</div>
        <div class="text-xs font-semibold text-white/70">Q {currentQ + 1} of {questions.length}</div>
      </div>
    </div>
    <div class="flex flex-1 flex-col items-end gap-1">
      <span class="text-[10px] text-white/40">{progress}% done</span>
      <div class="pbar w-full">
        <div class="pfill bg-gradient-to-r from-gold to-gold/70" style="width:{progress + 2}%"></div>
      </div>
    </div>
  </div>

  <!-- Question Body -->
  <div class="p-5">
    {#if feedback}
      <div class="mb-4 rounded-xl p-3 text-xs font-semibold {feedbackOk ? 'bg-jade/10 border border-jade/20 text-jade' : 'bg-scarlet/10 border border-scarlet/20 text-scarlet'}">
        {feedback}
      </div>
    {/if}
    <div class="border border-white/05 rounded-xl p-4 mb-4">
      <p class="text-sm leading-relaxed text-white/85">{q?.q ?? 'Loading...'}</p>
    </div>
    <div class="space-y-2 mb-4">
      {#each (q?.opts ?? []) as opt, i}
        {@const isAnswered = answered[currentQ] !== null}
        {@const isCorrect = isAnswered && i === q?.correct}
        {@const isWrongPick = isAnswered && i === answered[currentQ] && i !== q?.correct}
        <button onclick={() => selectAnswer(i)} disabled={isAnswered}
          class="opt-btn w-full flex items-center gap-3 p-3 text-left {isCorrect ? 'correct' : ''} {isWrongPick ? 'wrong' : ''}">
          <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-cobalt/60 text-[10px] font-bold text-gold shrink-0">{labels[i]}</span>
          <span class="text-xs text-white/80 flex-1">{opt}</span>
        </button>
      {/each}
    </div>
    <div class="flex items-center justify-between gap-3">
      <button onclick={prevQ} class="btn-ghost text-xs px-3 py-2">← Prev</button>
      <button onclick={nextQ} class="btn-primary text-xs px-4 py-2">Next →</button>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-white/05 px-5 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2 text-xs text-white/30">
      <span class="pulse-dot h-1.5 w-1.5 rounded-full bg-jade inline-block"></span>AI · Nigerian Curriculum
    </div>
    <button onclick={onSignup} class="text-xs text-gold hover:text-gold/80 font-medium">Full Platform →</button>
  </div>
</div>
