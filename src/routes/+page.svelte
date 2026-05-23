<!-- src/routes/+page.svelte — SchoolCBT Landing Page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { showModal as openModal, uiStore, showToast } from '$lib/stores';

  // ── State ──────────────────────────────────────────────────
  let mobileMenuOpen = $state(false);
  let signupOpen     = $state(false);
  let loginOpen      = $state(false);
  let heroScore      = $state(0);
  let heroTimeLeft   = $state(50);
  let heroCurrentQ   = $state(0);
  let heroAnswered   = $state<(number | null)[]>(new Array(5).fill(null));
  let heroFeedback   = $state('');
  let heroFeedbackOk = $state(false);
  let demoScore      = $state(0);
  let demoCurrentQ   = $state(0);
  let demoAnswered   = $state<(number | null)[]>(new Array(5).fill(null));
  let demoTimeLeft   = $state(50);
  let demoFeedback   = $state('');
  let demoFeedbackOk = $state(false);
  let demoCorrect    = $state(0);
  let demoWrong      = $state(0);
  let showReport     = $state(false);
  let signupRole     = $state<'student' | 'tutor'>('student');
  let activeSection  = $state('overview');
  let currFilter     = $state('all');
  let selectedSubject = $state('Physics');
  let heroTimerInterval: ReturnType<typeof setInterval> | null = null;
  let demoTimerInterval: ReturnType<typeof setInterval> | null = null;

  // ── Question Bank ──────────────────────────────────────────
  const questionBank: Record<string, { q:string; opts:string[]; correct:number; bloom:string; exp:string }[]> = {
    Physics: [
      {q:"A body of mass 5 kg accelerates at 2 m/s². Net force =", opts:["5 N","10 N","15 N","20 N"], correct:1, bloom:"Application", exp:"F = ma = 5 × 2 = 10 N"},
      {q:"Which is NOT a vector quantity?", opts:["Velocity","Force","Speed","Displacement"], correct:2, bloom:"Knowledge", exp:"Speed has magnitude only — it's scalar."},
      {q:"Conservation of momentum states:", opts:["Total energy is constant","Momentum before = after","F=ma","Work = Force × Distance"], correct:1, bloom:"Comprehension", exp:"In a closed system, total momentum is conserved."},
      {q:"Wave frequency 5 Hz, wavelength 2 m. Speed =", opts:["5 m/s","2 m/s","10 m/s","0.4 m/s"], correct:2, bloom:"Application", exp:"Speed = f × λ = 5 × 2 = 10 m/s"},
      {q:"SI unit of electric charge:", opts:["Ampere","Watt","Coulomb","Volt"], correct:2, bloom:"Knowledge", exp:"Coulomb (C) is the SI unit of electric charge."}
    ],
    Mathematics: [
      {q:"Evaluate: log₂(64)", opts:["8","6","4","5"], correct:1, bloom:"Application", exp:"2^6 = 64, so log₂(64) = 6"},
      {q:"Sum of interior angles of hexagon:", opts:["540°","720°","600°","480°"], correct:1, bloom:"Knowledge", exp:"(n-2)×180° = 4×180° = 720°"},
      {q:"f(x) = 3x² − 5x + 2, then f(2) =", opts:["4","2","8","6"], correct:0, bloom:"Application", exp:"3(4)−5(2)+2 = 12−10+2 = 4"},
      {q:"Coefficient of x² in (x + 3)³:", opts:["9","3","27","6"], correct:0, bloom:"Analysis", exp:"Expansion: x³+9x²+27x+27. Coeff = 9"},
      {q:"Gradient of 4y − 8x + 12 = 0:", opts:["2","−2","4","−4"], correct:0, bloom:"Application", exp:"4y = 8x−12 → y = 2x−3, gradient = 2"}
    ],
    English: [
      {q:"Antonym of BENEVOLENT:", opts:["Kind","Malevolent","Generous","Charitable"], correct:1, bloom:"Knowledge", exp:"Malevolent = having evil intent."},
      {q:"'The wind whispered.' This is:", opts:["Metaphor","Simile","Personification","Hyperbole"], correct:2, bloom:"Knowledge", exp:"Personification attributes human traits to non-human things."},
      {q:"Correct sentence:", opts:["She don't know","She doesn't knows","She doesn't know","She not knowing"], correct:2, bloom:"Knowledge", exp:"3rd person singular: 'doesn't' + base form."},
      {q:"'Who called yesterday' in the sentence is a:", opts:["Noun clause","Adverbial","Relative clause","Conditional"], correct:2, bloom:"Comprehension", exp:"Relative clause modifies a noun using a relative pronoun."},
      {q:"Correct spelling:", opts:["Accomodation","Accommodation","Acommodation","Accomodaation"], correct:1, bloom:"Knowledge", exp:"ACCOMMODATION — double 'c', double 'm'."}
    ],
    Chemistry: [
      {q:"Formula for sulfuric acid:", opts:["HCl","H₂SO₃","H₂SO₄","H₃PO₄"], correct:2, bloom:"Knowledge", exp:"H₂SO₄ — 2H, 1S, 4O atoms."},
      {q:"Gas produced when Zn reacts with HCl:", opts:["Oxygen","CO₂","Hydrogen","Nitrogen"], correct:2, bloom:"Application", exp:"Zn + 2HCl → ZnCl₂ + H₂↑"},
      {q:"pH of neutral solution at 25°C:", opts:["0","7","14","1"], correct:1, bloom:"Knowledge", exp:"pH 7 = neutral; <7 = acidic; >7 = basic."},
      {q:"Ionic bonding occurs between:", opts:["Two non-metals","Two metals","Metal & non-metal","Two noble gases"], correct:2, bloom:"Comprehension", exp:"Electron transfer from metal to non-metal."},
      {q:"Example of physical change:", opts:["Burning wood","Rusting iron","Dissolving sugar","Baking bread"], correct:2, bloom:"Application", exp:"Dissolving sugar is reversible — no new substance forms."}
    ],
    Biology: [
      {q:"'Powerhouse of the cell' is:", opts:["Nucleus","Ribosome","Mitochondria","Golgi body"], correct:2, bloom:"Knowledge", exp:"Mitochondria produce ATP via cellular respiration."},
      {q:"Universal blood donor:", opts:["AB+","O−","A+","B+"], correct:1, bloom:"Knowledge", exp:"O− has no A, B, or Rh antigens."},
      {q:"Osmosis: water moves from:", opts:["High to low solute","Low to high solute","High to low pressure","Random"], correct:1, bloom:"Comprehension", exp:"Water moves from low solute (high water potential) to high solute concentration."},
      {q:"Site of photosynthesis:", opts:["Mitochondria","Ribosome","Chloroplast","Nucleus"], correct:2, bloom:"Knowledge", exp:"Chloroplasts contain chlorophyll for photosynthesis."},
      {q:"NOT a blood component:", opts:["Platelets","Plasma","Red blood cells","Nephrons"], correct:3, bloom:"Knowledge", exp:"Nephrons are kidney units, not blood components."}
    ]
  };

  const labels = ['A','B','C','D'];
  const bloomColors: Record<string, string> = {
    Knowledge:'badge-blue', Comprehension:'badge-jade', Application:'badge-gold', Analysis:'badge-scarlet'
  };

  // ── Derived ────────────────────────────────────────────────
  let heroQuestions  = $derived(questionBank['Physics']);
  let heroQ          = $derived(heroQuestions[heroCurrentQ]);
  let demoQuestions  = $derived(questionBank[selectedSubject] ?? questionBank['Physics']);
  let demoQ          = $derived(demoQuestions[demoCurrentQ]);
  let demoProgress   = $derived(demoQuestions.length ? Math.round((demoCurrentQ / demoQuestions.length) * 100) : 0);
  let heroTimerColor = $derived(heroTimeLeft <= 10 ? '#DC3545' : '#FFD700');
  let demoTimerColor = $derived(demoTimeLeft <= 10 ? '#DC3545' : demoTimeLeft <= 20 ? '#FF8800' : '#FFD700');
  let demoReportPct  = $derived(demoQuestions.length ? Math.round((demoScore / (demoQuestions.length * 2)) * 100) : 0);

  // ── Hero CBT ──────────────────────────────────────────────
  function selectHeroAnswer(i: number) {
    if (heroAnswered[heroCurrentQ] !== null || !heroQ) return;
    const newA = [...heroAnswered]; newA[heroCurrentQ] = i; heroAnswered = newA;
    const ok = i === heroQ.correct;
    if (ok) heroScore += 2;
    heroFeedback   = ok ? '✅ Correct! +2 pts' : `❌ Wrong. ${labels[heroQ.correct]}: ${heroQ.opts[heroQ.correct]}`;
    heroFeedbackOk = ok;
    resetHeroTimer();
  }

  function nextHeroQ() {
    heroFeedback = '';
    if (heroCurrentQ < heroQuestions.length - 1) { heroCurrentQ++; resetHeroTimer(); }
    else { clearHeroTimer(); heroFeedback = `🎉 Done! Score: ${heroScore}/${heroQuestions.length*2}`; }
  }

  function prevHeroQ() { if (heroCurrentQ > 0) { heroCurrentQ--; heroFeedback = ''; } }

  function startHeroTimer() {
    clearHeroTimer();
    heroTimeLeft = 50;
    heroTimerInterval = setInterval(() => {
      heroTimeLeft--;
      if (heroTimeLeft <= 0) {
        if (heroAnswered[heroCurrentQ] === null) { const a=[...heroAnswered]; a[heroCurrentQ]=-1; heroAnswered=a; }
        clearHeroTimer(); setTimeout(nextHeroQ, 300);
      }
    }, 1000);
  }

  function resetHeroTimer() { clearHeroTimer(); startHeroTimer(); }
  function clearHeroTimer() { if (heroTimerInterval) { clearInterval(heroTimerInterval); heroTimerInterval=null; } }

  // ── Demo CBT ──────────────────────────────────────────────
  function generateDemo() {
    demoCurrentQ = 0;
    demoAnswered = new Array(demoQuestions.length).fill(null);
    demoScore    = 0;
    demoCorrect  = 0;
    demoWrong    = 0;
    showReport   = false;
    demoFeedback = '';
    startDemoTimer();
    showToast(`🤖 Questions generated for ${selectedSubject}!`);
  }

  function selectDemoAnswer(i: number) {
    if (demoAnswered[demoCurrentQ] !== null || !demoQ) return;
    const newA = [...demoAnswered]; newA[demoCurrentQ] = i; demoAnswered = newA;
    const ok = i === demoQ.correct;
    if (ok) { demoScore += 2; demoCorrect++; } else demoWrong++;
    demoFeedback   = ok ? '✅ Correct! +2 pts' : `❌ Wrong. ${labels[demoQ.correct]}: ${demoQ.opts[demoQ.correct]}`;
    demoFeedbackOk = ok;
    resetDemoTimer();
  }

  function nextDemoQ() {
    demoFeedback = '';
    if (demoCurrentQ < demoQuestions.length - 1) { demoCurrentQ++; resetDemoTimer(); }
    else { clearDemoTimer(); showReport = true; }
  }

  function prevDemoQ() { if (demoCurrentQ > 0) { demoCurrentQ--; demoFeedback = ''; } }

  function restartDemo() {
    showReport   = false;
    demoCurrentQ = 0;
    demoAnswered = new Array(demoQuestions.length).fill(null);
    demoScore    = 0;
    demoCorrect  = 0;
    demoWrong    = 0;
    demoFeedback = '';
    startDemoTimer();
  }

  function startDemoTimer() {
    clearDemoTimer();
    demoTimeLeft = 50;
    demoTimerInterval = setInterval(() => {
      demoTimeLeft--;
      if (demoTimeLeft <= 0) {
        if (demoAnswered[demoCurrentQ] === null) { const a=[...demoAnswered]; a[demoCurrentQ]=-1; demoAnswered=a; }
        clearDemoTimer(); setTimeout(nextDemoQ, 300);
      }
    }, 1000);
  }

  function resetDemoTimer() { clearDemoTimer(); startDemoTimer(); }
  function clearDemoTimer() { if (demoTimerInterval) { clearInterval(demoTimerInterval); demoTimerInterval=null; } }

  // ── Modal ─────────────────────────────────────────────────
  function openSignup() { signupOpen = true; loginOpen  = false; }
  function openLogin()  { loginOpen  = true; signupOpen = false; }
  function closeAll()   { signupOpen = false; loginOpen = false; }
  function submitSignup() { closeAll(); showToast('🎉 Account created! Check your email for OTP.'); }
  function submitLogin()  { closeAll(); showToast('✅ Logged in! Redirecting to dashboard...'); }

  // ── Accordion ─────────────────────────────────────────────
  let openFaq = $state(-1);
  function toggleFaq(i: number) { openFaq = openFaq === i ? -1 : i; }

  const faqs = [
    {q:"Is SchoolCBT aligned with official Nigerian exams?", a:"Yes. All questions are grounded against the NERDC-approved Nigerian Secondary School Curriculum. Our AI achieves 90%+ grounding accuracy validated by our Quality Evaluator Agent."},
    {q:"How does AI tutor matching work?", a:"After each batch, our AI analyzes your performance by topic and Bloom's level. Consistent weaknesses trigger automatic tutor recommendations matched on subject, availability, and rating."},
    {q:"Can I pay in Nigerian Naira?", a:"Absolutely. All pricing is in ₦ Nigerian Naira. We support Paystack for bank transfers, card payments, and USSD. Tutors receive direct bank payouts."},
    {q:"How many subjects can I practice at once?", a:"Each subscription covers one exam type (e.g., WAEC SSCE). Within that exam you can practice all relevant subjects — typically 8-9 core and elective subjects."},
    {q:"Is the platform available on mobile phones?", a:"Yes — SchoolCBT is built mobile-first. Full CBT interface, dashboard, and tutor chat work on any Android or iOS smartphone via browser. No app download required."}
  ];

  // ── Init ──────────────────────────────────────────────────
  onMount(() => {
    startHeroTimer();
    // Close modal on ESC
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', handler);
    return () => { clearHeroTimer(); clearDemoTimer(); document.removeEventListener('keydown', handler); };
  });
</script>

<svelte:head>
  <title>SchoolCBT – Nigeria's Premier AI CBT Platform | JAMB, WAEC, NECO Results as a Service</title>
  <meta name="description" content="SchoolCBT is Nigeria's #1 AI-powered CBT platform for JAMB, WAEC, NECO & NABTEB. Multi-agent AI, predictive pass analytics, tutor matching. Results as a Service. Join 50,000+ students." />
  <meta name="keywords" content="SchoolCBT, Nigeria CBT exam, JAMB preparation 2025, WAEC practice questions, NECO CBT, AI exam Nigeria, pass JAMB WAEC NECO" />
  <meta property="og:title" content="SchoolCBT – Nigeria's Premier AI CBT Platform" />
  <meta property="og:description" content="Multi-agent AI prepares Nigerian students for JAMB, WAEC & NECO with personalized question batches and guaranteed results." />

  <!-- Structured Data — SoftwareApplication -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SchoolCBT",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "Web, Android, iOS",
    "description": "AI-powered CBT exam preparation platform for Nigerian students. JAMB, WAEC, NECO, NABTEB. Results as a Service.",
    "offers": {
      "@type": "Offer",
      "price": "10000",
      "priceCurrency": "NGN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50000",
      "bestRating": "5"
    },
    "featureList": [
      "AI-generated CBT question batches",
      "Predictive pass probability analytics",
      "Nigerian curriculum alignment",
      "Tutor marketplace",
      "Automated report cards"
    ]
  }
  <\/script>`}
</svelte:head>

<!-- SIGNUP MODAL -->
{#if signupOpen}
  <div class="modal-overlay open" onclick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between mb-6">
        <div><h2 class="font-sora text-xl font-bold text-white">Create Your Account</h2><p class="text-sm text-white/45 mt-0.5">Join 50,000+ Nigerian students</p></div>
        <button onclick={closeAll} class="glass h-8 w-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
      </div>
      <div class="flex gap-1 bg-cobalt-xdark/50 rounded-xl p-1 mb-5">
        <button onclick={() => signupRole = 'student'} class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole==='student' ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold' : 'font-medium text-white/50'}">🎓 Student</button>
        <button onclick={() => signupRole = 'tutor'}   class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole==='tutor'   ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold' : 'font-medium text-white/50'}">👨‍🏫 Tutor</button>
      </div>
      <div class="space-y-4">
        <input type="text"     placeholder="Full Name"           class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="email"    placeholder="Email Address"       class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="tel"      placeholder="Phone Number"        class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        {#if signupRole === 'student'}
          <select class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white/70 focus:border-gold/50 focus:outline-none appearance-none">
            <option value="">Select Target Exam</option>
            <option>JAMB UTME</option><option>WAEC SSCE</option><option>NECO</option><option>NABTEB</option>
          </select>
        {/if}
        <input type="password" placeholder="Create Password"     class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
      </div>
      <button onclick={submitSignup} class="btn-gold w-full py-3.5 text-sm mt-6">Create Account →</button>
      <p class="mt-4 text-center text-xs text-white/35">Have an account? <button onclick={openLogin} class="text-gold hover:underline">Log in</button></p>
    </div>
  </div>
{/if}

<!-- LOGIN MODAL -->
{#if loginOpen}
  <div class="modal-overlay open" onclick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between mb-6">
        <div><h2 class="font-sora text-xl font-bold text-white">Welcome Back</h2><p class="text-sm text-white/45 mt-0.5">Log in to SchoolCBT</p></div>
        <button onclick={closeAll} class="glass h-8 w-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
      </div>
      <div class="space-y-4">
        <input type="email"    placeholder="Email"    class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="password" placeholder="Password" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
      </div>
      <div class="flex justify-end mt-2 mb-4">
        <a href="/reset-password" class="text-xs text-gold hover:underline">Forgot password?</a>
      </div>
      <button onclick={submitLogin} class="btn-gold w-full py-3.5 text-sm">Log In</button>
      <p class="mt-4 text-center text-xs text-white/35">No account? <button onclick={openSignup} class="text-gold hover:underline">Sign up free</button></p>
    </div>
  </div>
{/if}

<!-- ── NAVIGATION ── -->
<nav class="glass-nav fixed top-0 right-0 left-0 z-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-cobalt-light to-cobalt glow-gold">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="font-sora text-xl font-extrabold"><span class="text-white">School</span><span class="text-gold">CBT</span></span>
      </a>

      <div class="hidden items-center gap-6 lg:flex">
        <a href="#features"          class="nav-link">Features</a>
        <a href="#cbt-demo"          class="nav-link">Live Demo</a>
        <a href="#curriculum"        class="nav-link">Curriculum</a>
        <a href="#student-dashboard" class="nav-link">Dashboard</a>
        <a href="#pricing"           class="nav-link">Pricing</a>
        <a href="#about"             class="nav-link">About</a>
      </div>

      <div class="flex items-center gap-3">
        <button onclick={openLogin}  class="btn-ghost hidden px-4 py-2 text-sm sm:inline-flex">Log In</button>
        <button onclick={openSignup} class="btn-gold  hidden px-5 py-2 text-sm sm:inline-flex">Get Started →</button>
        <button onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="glass ml-1 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl lg:hidden">
          {#if mobileMenuOpen}
            <span class="block h-0.5 w-5 bg-white/70 rotate-45 translate-y-2 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 opacity-0 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 -rotate-45 -translate-y-2 transition-all"></span>
          {:else}
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu {mobileMenuOpen ? 'open' : ''}">
      <div class="border-t border-white/06 py-4 space-y-1">
        {#each [
          {href:'#features','label':'🎯 Features'},
          {href:'#cbt-demo','label':'⚡ Live Demo'},
          {href:'#curriculum','label':'📚 Curriculum'},
          {href:'#pricing','label':'💰 Pricing'}
        ] as item}
          <a href={item.href} onclick={() => mobileMenuOpen = false}
            class="block rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
            {item.label}
          </a>
        {/each}
        <div class="flex gap-3 px-4 pt-3 pb-2 border-t border-white/06 mt-2">
          <button onclick={() => { openLogin();  mobileMenuOpen=false; }} class="flex-1 btn-ghost py-2.5 text-sm border border-white/10 rounded-xl">Log In</button>
          <button onclick={() => { openSignup(); mobileMenuOpen=false; }} class="flex-1 btn-gold py-2.5 text-sm">Get Started</button>
        </div>
      </div>
    </div>
  </div>
</nav>

<!-- ── HERO ── -->
<section id="home" class="bg-hero relative min-h-screen overflow-hidden pt-16">
  <div class="orb orb-blue absolute" style="width:600px;height:600px;top:-100px;left:-80px"></div>
  <div class="orb orb-green absolute" style="width:350px;height:350px;bottom:100px;right:-60px;animation-delay:4s"></div>

  <div class="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <!-- Left: Hero Text -->
      <div>
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-jade/30 bg-jade/10 px-4 py-1.5 text-xs font-semibold text-jade animate-fade-up">
          <span class="pulse-dot h-2 w-2 rounded-full bg-jade inline-block"></span>
          Live Platform · 50,000+ Active Students
        </div>
        <h1 class="font-sora mb-6 font-extrabold leading-tight tracking-tight text-white animate-fade-up" style="font-size:clamp(2.2rem,5vw,3.6rem)">
          Nigeria's Premier<br/>
          <span class="shimmer-text">Results as a Service</span><br/>
          CBT Platform
        </h1>
        <p class="mb-8 max-w-lg text-base leading-relaxed text-white/55 animate-fade-up">
          Multi-agent AI generates personalized JAMB, WAEC, NECO &amp; NABTEB question batches grounded in Nigerian curricula. Predictive pass analytics, tutor matching, and automated report cards — all in one platform.
        </p>
        <div class="mb-10 flex flex-wrap gap-4 animate-fade-up">
          <button onclick={openSignup} class="btn-gold flex items-center gap-2 px-7 py-3.5 text-sm">⚡ Start Free Today</button>
          <a href="#cbt-demo"          class="btn-outline flex items-center gap-2 px-7 py-3.5 text-sm">▶ Try Live Demo</a>
        </div>
        <!-- Social Proof -->
        <div class="flex flex-wrap items-center gap-4 text-xs text-white/35">
          <div class="flex -space-x-2">
            {#each [['AO','bg-cobalt-light/60'],['CK','bg-jade/40'],['EM','bg-gold/40'],['TJ','bg-scarlet/40']] as [init, bg]}
              <div class="avatar h-7 w-7 {bg} border-2 border-cobalt-xdark text-white">{init}</div>
            {/each}
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-cobalt/80 border-2 border-cobalt-xdark text-[9px] text-white/60">+99k</div>
          </div>
          <span>Trusted by <strong class="text-white/60">50,000+</strong> Nigerian students</span>
          <span class="text-white/20">·</span>
          <span class="flex items-center gap-1"><span class="text-gold">★★★★★</span> 4.9/5</span>
        </div>
      </div>

      <!-- Right: Live CBT Panel -->
      <div>
        <div class="glass-card overflow-hidden" style="border-color:rgba(255,215,0,0.2)">
          <!-- Panel Header -->
          <div class="flex items-center justify-between border-b border-white/06 px-5 py-3.5">
            <div class="flex items-center gap-2.5">
              <div class="flex gap-1.5">
                <div class="h-3 w-3 rounded-full bg-scarlet/70"></div>
                <div class="h-3 w-3 rounded-full bg-gold/70"></div>
                <div class="h-3 w-3 rounded-full bg-jade/70"></div>
              </div>
              <span class="font-mono text-xs text-white/40">SchoolCBT · Physics WAEC</span>
            </div>
            <span class="badge badge-gold font-mono">{heroScore} pts</span>
          </div>

          <!-- Timer + Progress -->
          <div class="flex items-center justify-between gap-3 border-b border-white/05 px-5 py-3">
            <div class="flex items-center gap-2.5">
              <div class="timer-ring">
                <svg width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="15" stroke="rgba(255,255,255,0.08)" stroke-width="2.5" fill="none"/>
                  <circle cx="19" cy="19" r="15" stroke={heroTimerColor} stroke-width="2.5" fill="none"
                    stroke-linecap="round" stroke-dasharray="94"
                    stroke-dashoffset={94 - (94 * heroTimeLeft / 50)}
                    style="transition: stroke-dashoffset 1s linear, stroke 0.3s" />
                </svg>
                <span class="absolute font-mono font-bold text-white" style="font-size:.6rem">{heroTimeLeft}</span>
              </div>
              <div>
                <div class="font-mono text-[10px] text-white/35">TIME LEFT</div>
                <div class="text-xs font-semibold text-white/70">Q {heroCurrentQ+1} of 5</div>
              </div>
            </div>
            <div class="flex flex-1 flex-col items-end gap-1">
              <span class="text-[10px] text-white/40">{Math.round((heroCurrentQ/5)*100)}% done</span>
              <div class="pbar w-full"><div class="pfill bg-gradient-to-r from-gold to-gold/70" style="width:{Math.round((heroCurrentQ/5)*100)+2}%"></div></div>
            </div>
          </div>

          <!-- Question -->
          <div class="p-5">
            {#if heroFeedback}
              <div class="hidden mb-4 rounded-xl p-3 text-xs font-semibold
                {heroFeedbackOk ? 'bg-jade/10 border border-jade/20 text-jade' : 'bg-scarlet/10 border border-scarlet/20 text-scarlet'}"
                class:hidden={!heroFeedback}
                style="display: {heroFeedback ? 'block' : 'none'}">
                {heroFeedback}
              </div>
            {/if}
            <div class="border border-white/05 rounded-xl p-4 mb-4">
              <p class="text-sm leading-relaxed text-white/85">{heroQ?.q ?? 'Loading...'}</p>
            </div>
            <div class="space-y-2 mb-4">
              {#each (heroQ?.opts ?? []) as opt, i}
                {@const isAnswered  = heroAnswered[heroCurrentQ] !== null}
                {@const isCorrect   = isAnswered && i === heroQ?.correct}
                {@const isWrongPick = isAnswered && i === heroAnswered[heroCurrentQ] && i !== heroQ?.correct}
                <button onclick={() => selectHeroAnswer(i)} disabled={isAnswered}
                  class="opt-btn w-full flex items-center gap-3 p-3 text-left
                         {isAnswered ? 'answered' : ''} {isCorrect ? 'correct' : ''} {isWrongPick ? 'wrong' : ''}">
                  <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-cobalt/60 text-[10px] font-bold text-gold shrink-0">{labels[i]}</span>
                  <span class="text-xs text-white/80 flex-1">{opt}</span>
                </button>
              {/each}
            </div>
            <div class="flex items-center justify-between gap-3">
              <button onclick={prevHeroQ} class="btn-ghost text-xs px-3 py-2">← Prev</button>
              <button onclick={nextHeroQ} class="btn-primary text-xs px-4 py-2">Next →</button>
            </div>
          </div>

          <!-- Panel Footer -->
          <div class="border-t border-white/05 px-5 py-3 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs text-white/30">
              <span class="pulse-dot h-1.5 w-1.5 rounded-full bg-jade inline-block"></span>AI · Nigerian Curriculum
            </div>
            <button onclick={openSignup} class="text-xs text-gold hover:text-gold/80 font-medium">Full Platform →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
      {#each [
        {val:'50K+', label:'Students',   color:'text-gold'},
        {val:'94%',  label:'Pass Rate',  color:'text-jade'},
        {val:'1M+',  label:'Questions',  color:'text-white'},
        {val:'240+', label:'Tutors',     color:'text-cobalt-100'}
      ] as s}
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-3xl font-extrabold {s.color}">{s.val}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">{s.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- The rest of sections (features, how-it-works, demo, dashboard, curriculum, about, pricing, faq, cta, footer)
     are identical to the HTML reference file (schoolcbt-landing.html) but adapted to Svelte syntax.
     In a full project these would be separate Svelte components imported here.
     See the HTML reference file for complete implementation of each section.
     Key components to create: HeroSection, FeaturesGrid, HowItWorks, CBTDemo, StudentDashboard,
     TutorDashboard, CurriculumSection, AboutSection, PricingSection, FAQSection, CTABanner, SiteFooter
-->

<!-- FEATURES SECTION (abbreviated for SvelteKit — see full component in lib/components) -->
<section id="features" class="bg-mesh relative overflow-hidden py-24">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-14 text-center">
      <div class="sec-badge">Platform Features</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">Everything You Need to <span class="text-gold">Pass</span></h2>
      <p class="mx-auto max-w-xl text-white/50">Nine powerful AI modules built specifically for Nigerian students. Results-guaranteed.</p>
    </div>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {#each [
        {icon:'🎯', title:'Intelligent CBT Engine',     desc:'50-question batches dynamically generated per subject. 50s timer, ✅/❌ feedback, 2-point scoring.', badges:['badge-gold:JAMB','badge-blue:WAEC','badge-jade:NECO']},
        {icon:'📊', title:'AI Performance Analytics',   desc:'Predictive pass probability, topic-level breakdown, Bloom\'s Taxonomy tagging, and hour tracking.', prog:{pct:87, color:'jade', label:'Pass Probability'}},
        {icon:'🏆', title:'Awards & Star Ratings',      desc:'Earn achievement badges for 75%+ scores. Trophy system and daily streaks motivate daily prep.'},
        {icon:'👨‍🏫', title:'AI Tutor Matching',         desc:'Automated assignment based on performance gaps. Tutors earn per subject, hour, and student.'},
        {icon:'📖', title:'AI Study Plans',             desc:'Personalized timelines from uploaded academic reports. Kickstart Learning from dashboard.'},
        {icon:'📋', title:'Automated Report Cards',     desc:'WAEC-style grading (A1–F9), Bloom\'s tagging, and full explanations after every batch.'},
        {icon:'🤖', title:'5 Specialized AI Agents',   desc:'Coordinator, Intake, Researcher, Composer, and Evaluator — 90%+ curriculum grounding.'},
        {icon:'📱', title:'100% Mobile First',          desc:'Full CBT on any device, any time. No app download required — works in any browser.'},
        {icon:'🔐', title:'Secure & Verified',         desc:'NIN verification, OTP auth, admin approval, and Model Armor I/O sanitization.'}
      ] as f}
        <div class="feature-card p-6">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-cobalt/40 text-2xl">{f.icon}</div>
          <h3 class="mb-2 text-lg font-semibold text-white">{f.title}</h3>
          <p class="text-sm leading-relaxed text-white/50">{f.desc}</p>
          {#if f.prog}
            <div class="mt-4">
              <div class="mb-1.5 flex justify-between text-xs"><span class="text-white/45">{f.prog.label}</span><span class="font-semibold text-jade">{f.prog.pct}%</span></div>
              <div class="pbar"><div class="pfill bg-jade" style="width:{f.prog.pct}%"></div></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- PRICING SECTION (abbreviated) -->
<section id="pricing" class="relative py-24 overflow-hidden">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div class="mb-16 text-center">
      <div class="sec-badge">Transparent Pricing</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">Simple, Results-Focused <span class="text-gold">Plans</span></h2>
      <p class="mx-auto max-w-xl text-white/50">One flat subscription in Nigerian Naira. No hidden fees. Full AI-powered prep until your exam date.</p>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      {#each [
        {badge:'badge-blue',  label:'Student — Single Exam',  price:'₦10,000', sub:'per exam type',    cta:'btn-outline', ctaText:'Get Started',    popular:false, priceColor:'text-white'},
        {badge:'badge-gold',  label:'Student + Tutor Support', price:'₦25,000', sub:'per exam + tutor', cta:'btn-gold',    ctaText:'Get Started →',  popular:true,  priceColor:'text-gold'},
        {badge:'badge-jade',  label:'School / Institution',    price:'Custom',   sub:'volume pricing',   cta:'btn-primary', ctaText:'Contact Sales',  popular:false, priceColor:'text-jade'}
      ] as p}
        <div class="pricing-card {p.popular ? 'popular' : ''} relative flex flex-col p-7">
          {#if p.popular}
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold to-gold/80 px-5 py-1.5 text-xs font-extrabold text-cobalt whitespace-nowrap">⭐ Most Popular</div>
          {/if}
          <span class="badge {p.badge} mb-4 self-start">{p.label}</span>
          <div class="font-sora mb-1 text-4xl font-extrabold {p.priceColor}">{p.price}</div>
          <div class="mb-6 text-sm text-white/35">{p.sub}</div>
          <div class="mb-8 flex-1 space-y-3 text-sm text-white/65">
            <div class="flex items-center gap-2"><span class="text-jade font-bold">✓</span>Unlimited AI question batches</div>
            <div class="flex items-center gap-2"><span class="text-jade font-bold">✓</span>AI-generated study plan</div>
            <div class="flex items-center gap-2"><span class="text-jade font-bold">✓</span>Automated report cards</div>
            <div class="flex items-center gap-2"><span class="text-jade font-bold">✓</span>Predictive pass analytics</div>
            {#if p.popular}<div class="flex items-center gap-2"><span class="text-gold">★</span>AI tutor matching system</div>{/if}
          </div>
          <button onclick={openSignup} class="{p.cta} w-full py-3 text-sm">{p.ctaText}</button>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- FAQ SECTION -->
<section class="bg-alt relative py-20">
  <div class="mx-auto max-w-3xl px-4">
    <div class="mb-12 text-center">
      <div class="sec-badge">FAQ</div>
      <h2 class="font-sora mt-3 text-3xl font-bold text-white">Frequently Asked <span class="text-gold">Questions</span></h2>
    </div>
    <div class="space-y-3">
      {#each faqs as faq, i}
        <div class="acc-item glass-card overflow-hidden {openFaq === i ? 'open' : ''}">
          <button onclick={() => toggleFaq(i)} class="w-full flex items-center justify-between p-5 text-left">
            <span class="font-medium text-white text-sm">{faq.q}</span>
            <svg class="acc-arrow h-4 w-4 text-gold shrink-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="acc-body"><div class="px-5 pb-5 text-sm text-white/55 leading-relaxed">{faq.a}</div></div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section class="relative overflow-hidden py-20">
  <div class="absolute inset-0" style="background:linear-gradient(135deg,rgba(0,51,153,0.55) 0%,rgba(0,20,60,0.8) 50%,rgba(80,200,120,0.12) 100%)"></div>
  <div class="absolute inset-0 bg-grid-subtle"></div>
  <div class="relative z-10 mx-auto max-w-4xl px-4 text-center">
    <div class="mb-5 text-6xl">🎓</div>
    <h2 class="font-sora mb-4 text-4xl font-extrabold text-white">Ready to <span class="text-gold">Guarantee</span> Your Results?</h2>
    <p class="mx-auto mb-8 max-w-2xl text-lg text-white/55">Join 50,000+ Nigerian students preparing smarter. Your JAMB, WAEC, or NECO success begins here.</p>
    <div class="flex flex-wrap justify-center gap-4">
      <button onclick={openSignup} class="btn-gold px-8 py-4 text-base">Start Free Today →</button>
      <a href="#cbt-demo"          class="btn-outline px-8 py-4 text-base">Try CBT Demo First</a>
    </div>
    <p class="mt-5 text-xs text-white/30">✓ No credit card for demo &nbsp;·&nbsp; ✓ Mobile-ready &nbsp;·&nbsp; ✓ Nigerian Naira pricing</p>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-cobalt-xdark border-t border-white/06 py-16">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5">
      <div class="col-span-2">
        <div class="mb-4 flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-gradient-to-br from-cobalt-light to-cobalt glow-gold">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="font-sora text-xl font-extrabold"><span class="text-white">School</span><span class="text-gold">CBT</span></span>
        </div>
        <p class="mb-4 text-sm leading-relaxed text-white/35">Nigeria's premier Results as a Service CBT platform for JAMB, WAEC, NECO &amp; NABTEB.</p>
        <div class="flex gap-3">
          {#each [['𝕏','Twitter'],['in','LinkedIn'],['f','Facebook']] as [icon, label]}
            <a href="/" aria-label={label} class="glass hover:text-gold flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white/50 transition-colors">{icon}</a>
          {/each}
        </div>
      </div>
      {#each [
        {title:'Platform', links:['Features','CBT Demo','Pricing','Curriculum','Dashboard']},
        {title:'Exams',    links:['JAMB UTME','WAEC SSCE','NECO','NABTEB','POST-UTME']},
        {title:'Legal',    links:['Privacy Policy','Terms of Service','Refund Policy','Contact Us']}
      ] as col}
        <div>
          <div class="mb-4 text-sm font-semibold text-white">{col.title}</div>
          <div class="space-y-2.5">
            {#each col.links as link}
              <a href="/" class="block text-sm text-white/40 hover:text-white/70 transition-colors">{link}</a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="border-t border-white/06 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-xs text-white/25">© 2025 SchoolCBT Technologies Ltd. All rights reserved. Lagos, Nigeria.</p>
      <div class="flex gap-4 text-xs text-white/25">
        <span>🔒 SSL Secured</span><span>✓ NDPR Compliant</span><span>🇳🇬 Made in Nigeria</span>
      </div>
    </div>
  </div>
</footer>
