<script lang="ts">
  let { onSignup }: { onSignup: () => void } = $props();

  const labels = ['A', 'B', 'C', 'D'];
  const bloomColors: Record<string, string> = { Knowledge:'badge-blue', Comprehension:'badge-jade', Application:'badge-gold', Analysis:'badge-scarlet' };

  const questionBank: Record<string, { q:string; opts:string[]; correct:number; bloom:string; exp:string }[]> = {
    Physics: [
      { q:"A body of mass 5 kg accelerates at 2 m/s². Net force =", opts:["5 N","10 N","15 N","20 N"], correct:1, bloom:"Application", exp:"F = ma = 5 × 2 = 10 N" },
      { q:"Which is NOT a vector quantity?", opts:["Velocity","Force","Speed","Displacement"], correct:2, bloom:"Knowledge", exp:"Speed has magnitude only — it's scalar." },
      { q:"Conservation of momentum states:", opts:["Total energy is constant","Momentum before = after","F=ma","Work = Force × Distance"], correct:1, bloom:"Comprehension", exp:"In a closed system, total momentum is conserved." },
      { q:"Wave frequency 5 Hz, wavelength 2 m. Speed =", opts:["5 m/s","2 m/s","10 m/s","0.4 m/s"], correct:2, bloom:"Application", exp:"Speed = f × λ = 5 × 2 = 10 m/s" },
      { q:"SI unit of electric charge:", opts:["Ampere","Watt","Coulomb","Volt"], correct:2, bloom:"Knowledge", exp:"Coulomb (C) is the SI unit of electric charge." }
    ],
    Mathematics: [
      { q:"Evaluate: log₂(64)", opts:["8","6","4","5"], correct:1, bloom:"Application", exp:"2^6 = 64, so log₂(64) = 6" },
      { q:"Sum of interior angles of hexagon:", opts:["540°","720°","600°","480°"], correct:1, bloom:"Knowledge", exp:"(n-2)×180° = 4×180° = 720°" },
      { q:"f(x) = 3x² − 5x + 2, then f(2) =", opts:["4","2","8","6"], correct:0, bloom:"Application", exp:"3(4)−5(2)+2 = 12−10+2 = 4" },
      { q:"Coefficient of x² in (x + 3)³:", opts:["9","3","27","6"], correct:0, bloom:"Analysis", exp:"Expansion: x³+9x²+27x+27. Coeff = 9" },
      { q:"Gradient of 4y − 8x + 12 = 0:", opts:["2","−2","4","−4"], correct:0, bloom:"Application", exp:"4y = 8x−12 → y = 2x−3, gradient = 2" }
    ],
    English: [
      { q:"Antonym of BENEVOLENT:", opts:["Kind","Malevolent","Generous","Charitable"], correct:1, bloom:"Knowledge", exp:"Malevolent = having evil intent." },
      { q:"'The wind whispered.' This is:", opts:["Metaphor","Simile","Personification","Hyperbole"], correct:2, bloom:"Knowledge", exp:"Personification attributes human traits to non-human things." },
      { q:"Correct sentence:", opts:["She don't know","She doesn't knows","She doesn't know","She not knowing"], correct:2, bloom:"Knowledge", exp:"3rd person singular: 'doesn't' + base form." },
      { q:"'Who called yesterday' in the sentence is a:", opts:["Noun clause","Adverbial","Relative clause","Conditional"], correct:2, bloom:"Comprehension", exp:"Relative clause modifies a noun using a relative pronoun." },
      { q:"Correct spelling:", opts:["Accomodation","Accommodation","Acommodation","Accomodaation"], correct:1, bloom:"Knowledge", exp:"ACCOMMODATION — double 'c', double 'm'." }
    ],
    Chemistry: [
      { q:"Formula for sulfuric acid:", opts:["HCl","H₂SO₃","H₂SO₄","H₃PO₄"], correct:2, bloom:"Knowledge", exp:"H₂SO₄ — 2H, 1S, 4O atoms." },
      { q:"Gas produced when Zn reacts with HCl:", opts:["Oxygen","CO₂","Hydrogen","Nitrogen"], correct:2, bloom:"Application", exp:"Zn + 2HCl → ZnCl₂ + H₂↑" },
      { q:"pH of neutral solution at 25°C:", opts:["0","7","14","1"], correct:1, bloom:"Knowledge", exp:"pH 7 = neutral; <7 = acidic; >7 = basic." },
      { q:"Ionic bonding occurs between:", opts:["Two non-metals","Two metals","Metal & non-metal","Two noble gases"], correct:2, bloom:"Comprehension", exp:"Electron transfer from metal to non-metal." },
      { q:"Example of physical change:", opts:["Burning wood","Rusting iron","Dissolving sugar","Baking bread"], correct:2, bloom:"Application", exp:"Dissolving sugar is reversible — no new substance forms." }
    ],
    Biology: [
      { q:"'Powerhouse of the cell' is:", opts:["Nucleus","Ribosome","Mitochondria","Golgi body"], correct:2, bloom:"Knowledge", exp:"Mitochondria produce ATP via cellular respiration." },
      { q:"Universal blood donor:", opts:["AB+","O−","A+","B+"], correct:1, bloom:"Knowledge", exp:"O− has no A, B, or Rh antigens." },
      { q:"Osmosis: water moves from:", opts:["High to low solute","Low to high solute","High to low pressure","Random"], correct:1, bloom:"Comprehension", exp:"Water moves from low solute to high solute concentration." },
      { q:"Site of photosynthesis:", opts:["Mitochondria","Ribosome","Chloroplast","Nucleus"], correct:2, bloom:"Knowledge", exp:"Chloroplasts contain chlorophyll for photosynthesis." },
      { q:"NOT a blood component:", opts:["Platelets","Plasma","Red blood cells","Nephrons"], correct:3, bloom:"Knowledge", exp:"Nephrons are kidney units, not blood components." }
    ]
  };

  const subjects = [
    { key:'Physics', name:'Physics', exam:'WAEC SSCE', icon:'⚛️' },
    { key:'Mathematics', name:'Mathematics', exam:'JAMB UTME', icon:'📐' },
    { key:'English', name:'English Language', exam:'WAEC SSCE', icon:'📝' },
    { key:'Chemistry', name:'Chemistry', exam:'NECO', icon:'🧪' },
    { key:'Biology', name:'Biology', exam:'JAMB UTME', icon:'🧬' }
  ];

  let selectedSubject = $state('Physics');
  let score = $state(0);
  let currentQ = $state(0);
  let answered = $state<(number | null)[]>([]);
  let timeLeft = $state(50);
  let feedback = $state('');
  let feedbackOk = $state(false);
  let correctCount = $state(0);
  let wrongCount = $state(0);
  let showReport = $state(false);
  let showExplanation = $state(false);
  let selectedExp = $state('');
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const questions = $derived(questionBank[selectedSubject] ?? questionBank['Physics']);
  const q = $derived(questions[currentQ]);
  const progress = $derived(questions.length ? Math.round((currentQ / questions.length) * 100) : 0);
  const reportPct = $derived(questions.length ? Math.round((score / (questions.length * 2)) * 100) : 0);
  const waecGrade = $derived(reportPct >= 90 ? 'A1' : reportPct >= 80 ? 'B2' : reportPct >= 70 ? 'B3' : reportPct >= 60 ? 'C4' : reportPct >= 50 ? 'C5' : reportPct >= 45 ? 'D7' : reportPct >= 40 ? 'E8' : 'F9');
  const grades = $derived({
    'A1': { color:'text-jade', desc:'Excellent' }, 'B2': { color:'text-jade', desc:'Very Good' }, 'B3': { color:'text-jade', desc:'Good' },
    'C4': { color:'text-gold', desc:'Credit' }, 'C5': { color:'text-gold', desc:'Credit' },
    'D7': { color:'text-scarlet', desc:'Pass' }, 'E8': { color:'text-scarlet', desc:'Pass' }, 'F9': { color:'text-scarlet', desc:'Fail' }
  });
  const timerColor = $derived(timeLeft <= 10 ? '#DC3545' : timeLeft <= 20 ? '#FF8800' : '#FFD700');
  const examLabel = $derived(subjects.find(s => s.key === selectedSubject)?.name + ' · ' + subjects.find(s => s.key === selectedSubject)?.exam);

  function selectSubject(key: string) {
    selectedSubject = key;
    resetState();
  }

  function generateDemo() {
    resetState();
  }

  function resetState() {
    currentQ = 0;
    answered = new Array(questions.length).fill(null);
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    showReport = false;
    feedback = '';
    startDemoTimer();
  }

  function selectAnswer(i: number) {
    if (answered[currentQ] !== null || !q) return;
    const newA = [...answered]; newA[currentQ] = i; answered = newA;
    const ok = i === q.correct;
    if (ok) { score += 2; correctCount++; } else wrongCount++;
    feedback = ok ? '✅ Correct! +2 pts' : `❌ Wrong. ${labels[q.correct]}: ${q.opts[q.correct]}`;
    feedbackOk = ok;
    showExplanation = true;
    selectedExp = q.exp;
    resetDemoTimer();
  }

  function nextDemoQ() {
    feedback = '';
    showExplanation = false;
    if (currentQ < questions.length - 1) { currentQ++; resetDemoTimer(); }
    else { clearTimer(); showReport = true; }
  }

  function prevDemoQ() { if (currentQ > 0) { currentQ--; feedback = ''; showExplanation = false; } }

  function startDemoTimer() {
    clearTimer();
    timeLeft = 50;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (answered[currentQ] === null) { const a = [...answered]; a[currentQ] = -1; answered = a; }
        clearTimer(); setTimeout(nextDemoQ, 300);
      }
    }, 1000);
  }

  function resetDemoTimer() { clearTimer(); startDemoTimer(); }
  function clearTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

  import { onMount } from 'svelte';
  onMount(() => {
    answered = new Array(questions.length).fill(null);
    startDemoTimer();
    return () => clearTimer();
  });
</script>

<section id="cbt-demo" class="bg-alt relative overflow-hidden py-24">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <div class="sec-badge">Interactive CBT Demo</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">Experience the <span class="text-gold">Full CBT Interface</span></h2>
      <p class="mx-auto max-w-xl text-white/50">Try a live 5-question AI-generated practice batch. Real timer, instant feedback, WAEC grading — exactly as it feels on the full platform.</p>
    </div>

    <div class="grid gap-8 lg:grid-cols-5">
      <!-- Subject Selector Sidebar -->
      <div class="lg:col-span-2 space-y-4">
        <div class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4 text-sm">Select Subject &amp; Exam</h3>
          <div class="space-y-2 mb-5">
            {#each subjects as subj}
              <button onclick={() => selectSubject(subj.key)}
                class="subject-btn w-full text-left rounded-xl p-3 flex items-center gap-3 border {selectedSubject === subj.key ? 'border-gold/30 bg-cobalt/40' : 'border-white/07 bg-cobalt/20 hover:border-gold/20'} transition-all">
                <span class="text-lg">{subj.icon}</span>
                <div>
                  <div class="text-sm font-semibold text-white">{subj.name}</div>
                  <div class="text-xs text-white/40">{subj.exam}</div>
                </div>
                {#if selectedSubject === subj.key}
                  <span class="badge badge-gold ml-auto">Selected</span>
                {/if}
              </button>
            {/each}
          </div>
          <button onclick={generateDemo} class="btn-gold w-full py-3 text-sm">🤖 Generate AI Questions</button>
        </div>

        <!-- Score Panel -->
        <div class="glass-card p-5">
          <div class="text-xs font-mono text-white/40 mb-3">LIVE SESSION STATS</div>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center"><div class="font-sora font-bold text-jade text-xl">{correctCount}</div><div class="text-[10px] text-white/35 mt-0.5">Correct</div></div>
            <div class="text-center"><div class="font-sora font-bold text-scarlet text-xl">{wrongCount}</div><div class="text-[10px] text-white/35 mt-0.5">Wrong</div></div>
            <div class="text-center"><div class="font-sora font-bold text-gold text-xl">{score}</div><div class="text-[10px] text-white/35 mt-0.5">Points</div></div>
          </div>
          <div class="mt-3">
            <div class="flex justify-between text-xs mb-1"><span class="text-white/40">Session Progress</span><span class="text-white/60">{progress}%</span></div>
            <div class="pbar"><div class="pfill bg-gradient-to-r from-jade to-jade/50" style="width:{progress}%"></div></div>
          </div>
        </div>
      </div>

      <!-- Main CBT Panel -->
      <div class="lg:col-span-3">
        <div class="glass-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-white/06 px-5 py-4">
            <div>
              <div class="text-xs font-mono text-white/35 mb-0.5">SCHOOLCBT LIVE PRACTICE</div>
              <div class="text-sm font-semibold text-white">{examLabel}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="timer-ring">
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"/>
                  <circle cx="22" cy="22" r="18" stroke={timerColor} stroke-width="3" fill="none"
                    stroke-linecap="round" stroke-dasharray="113"
                    stroke-dashoffset={113 - (113 * timeLeft / 50)}
                    style="transition: stroke-dashoffset 1s linear, stroke 0.3s" />
                </svg>
                <span class="absolute font-mono font-bold text-white" style="font-size:.65rem">{timeLeft}</span>
              </div>
              <span class="badge badge-gold font-mono text-sm">{score} pts</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-b border-white/05 px-5 py-3">
            <div class="flex gap-1.5">
              {#each answered as a, i}
                <div class="h-2 w-2 rounded-full {i === currentQ ? 'bg-gold' : a === null ? 'bg-white/15' : a >= 0 ? 'bg-jade' : 'bg-scarlet'}"></div>
              {/each}
            </div>
            <div class="text-xs text-white/35">Q {currentQ + 1} of {questions.length}</div>
          </div>

          <div class="px-5 pt-3">
            <div class="pbar"><div class="pfill bg-gradient-to-r from-gold to-gold/60" style="width:{progress + 2}%"></div></div>
          </div>

          <div class="p-5">
            {#if feedback}
              <div class="mb-4 rounded-xl p-4 text-sm font-medium {feedbackOk ? 'border border-jade/18 bg-jade/6 text-jade' : 'border border-scarlet/18 bg-scarlet/6 text-scarlet'}">
                {feedback}
              </div>
            {/if}

            <div class="border border-white/05 bg-white/2 rounded-xl p-5 mb-5">
              <div class="flex items-start gap-3">
                {#if q}
                  <span class="badge {bloomColors[q.bloom] ?? 'badge-blue'} mt-0.5 shrink-0">{q.bloom}</span>
                {/if}
                <p class="text-sm leading-relaxed text-white/85">{q?.q ?? 'Loading...'}</p>
              </div>
            </div>

            <div class="mb-5 space-y-2.5">
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

            {#if showExplanation}
              <div class="mb-5 rounded-xl border border-jade/18 bg-jade/6 p-4">
                <div class="text-jade mb-2 text-xs font-semibold">💡 Explanation</div>
                <p class="text-sm leading-relaxed text-white/65">{selectedExp}</p>
              </div>
            {/if}

            <div class="flex flex-wrap items-center justify-between gap-3">
              <button onclick={prevDemoQ} class="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">← Previous</button>
              <button onclick={nextDemoQ} class="btn-primary flex items-center gap-2 px-5 py-2 text-sm">Next Question →</button>
            </div>
          </div>
        </div>

        <!-- Report Card -->
        {#if showReport}
          <div class="glass-card mt-5 p-6 animate-fade-up">
            <div class="mb-6 text-center">
              <div class="mb-3 text-6xl">{reportPct >= 75 ? '🎉' : '📊'}</div>
              <h3 class="font-sora mb-2 text-2xl font-bold text-white">Batch Complete!</h3>
              <div class="font-sora {grades[waecGrade]?.color ?? 'text-gold'} my-3 text-5xl font-extrabold">{waecGrade}</div>
              <div class="mb-2 text-lg text-white/60">{grades[waecGrade]?.desc ?? ''}</div>
              <div class="text-sm text-white/50">You scored {score}/{questions.length * 2} points ({reportPct}%)</div>
            </div>
            <div class="mb-6 grid gap-4 sm:grid-cols-3">
              <div class="bg-cobalt/30 rounded-xl p-4 text-center"><div class="font-sora text-jade text-2xl font-bold">{correctCount}</div><div class="mt-1 text-xs text-white/45">Correct</div></div>
              <div class="bg-cobalt/30 rounded-xl p-4 text-center"><div class="font-sora text-scarlet text-2xl font-bold">{wrongCount}</div><div class="mt-1 text-xs text-white/45">Wrong</div></div>
              <div class="bg-cobalt/30 rounded-xl p-4 text-center"><div class="font-sora text-2xl font-bold text-white/60">{questions.length - correctCount - wrongCount}</div><div class="mt-1 text-xs text-white/45">Unanswered</div></div>
            </div>
            <div class="bg-cobalt/30 mb-5 rounded-xl p-4">
              <div class="text-gold mb-2 text-xs font-semibold">🤖 AI Performance Analysis</div>
              <p class="text-sm leading-relaxed text-white/60">
                {reportPct >= 80 ? 'Outstanding! Your performance indicates strong subject mastery. Focus on maintaining consistency with timed practice.' :
                 reportPct >= 60 ? 'Good effort! Review the topics where you missed questions and consider a study plan to boost your score.' :
                 'Keep practicing! Use the full platform\'s AI study plans and tutor matching to strengthen weak areas.'}
              </p>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
              <button onclick={generateDemo} class="btn-gold px-6 py-2.5 text-sm">Try Again 🔄</button>
              <button onclick={onSignup} class="btn-outline px-6 py-2.5 text-sm">Full Platform →</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
