<script lang="ts">
  import { ogMeta, jsonLDBreadcrumb } from '$lib/seo';
</script>

<svelte:head>
  <title>About SchoolCBT — Nigeria's Premier AI CBT Platform</title>
  <meta name="description" content="SchoolCBT is Nigeria's leading AI-powered exam preparation platform. Our mission, team, and technology stack powering results for 50,000+ students." />
  <meta name="keywords" content="about SchoolCBT, Nigerian edtech, AI exam platform, education technology Nigeria" />
  {@html ogMeta({ title: 'About SchoolCBT — Nigeria\'s Premier AI CBT Platform', description: 'SchoolCBT is Nigeria\'s leading AI-powered exam preparation platform. Our mission, team, and technology stack powering results for 50,000+ students.', path: '/about' })}
  {@html `<script type="application/ld+json">${jsonLDBreadcrumb([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])}<\/script>`}
</svelte:head>

<div class="min-h-screen bg-[#04091a] pt-20 pb-16">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <div class="sec-badge">About SchoolCBT</div>
      <h1 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">Our Mission to <span class="text-gold">Transform</span> Nigerian Education</h1>
      <p class="mx-auto max-w-2xl text-white/50">SchoolCBT is a Nigerian-built, AI-first platform making quality exam preparation accessible to every student across the country. We combine cutting-edge multi-agent AI with deep alignment to Nigerian curricula to deliver genuine Results as a Service.</p>
    </div>

    <div class="glass-card p-8 mb-10">
      <h2 class="font-sora text-2xl font-bold text-white mb-4">Our Story</h2>
      <p class="text-white/50 leading-relaxed mb-4">Founded in Lagos, Nigeria, SchoolCBT emerged from a simple observation: millions of Nigerian students sit for JAMB, WAEC, and NECO every year, yet access to quality, personalized preparation remains uneven. Traditional textbooks and generic online platforms don't adapt to individual learning gaps or align perfectly with Nigerian exam patterns.</p>
      <p class="text-white/50 leading-relaxed mb-4">Our multi-agent RaaS (Results as a Service) engine changes that. Five specialized AI agents — Coordinator, Intake, Researcher, Question Composer, and Quality Evaluator — work in concert to generate exam-grade questions, analyze performance by Bloom's Taxonomy level, predict pass probabilities, and match students with qualified tutors.</p>
      <p class="text-white/50 leading-relaxed">Today, SchoolCBT serves 50,000+ students across Nigeria's 36 states, with over 1 million AI-generated questions, a 94% pass rate, and a 4.9/5 student satisfaction score.</p>
    </div>

    <div class="grid gap-6 md:grid-cols-3 mb-10">
      {#each [
        {icon:'🎯', title:'Curriculum-Grounded', desc:'All questions verified against NERDC-approved Nigerian curricula with 90%+ grounding accuracy.'},
        {icon:'🤖', title:'AI-First', desc:'Five specialized AI agents orchestrate personalized exam preparation at scale.'},
        {icon:'🇳🇬', title:'Built in Nigeria', desc:'Designed by Nigerian educators and technologists who understand local exam systems.'}
      ] as value}
        <div class="stat-card p-6 text-center">
          <div class="text-3xl mb-3">{value.icon}</div>
          <h3 class="font-semibold text-white mb-2">{value.title}</h3>
          <p class="text-sm text-white/45">{value.desc}</p>
        </div>
      {/each}
    </div>

    <div class="glass-card p-8 mb-10">
      <h2 class="font-sora text-2xl font-bold text-white mb-4">Technology Stack</h2>
      <div class="grid gap-4 md:grid-cols-2">
        {#each [
          {icon:'🎓',title:'Google Vertex AI',desc:'Gemini 1.5 Pro for multimodal reasoning and question generation'},
          {icon:'⚡',title:'SvelteKit 5',desc:'Lightning-fast edge-rendered frontend deployed on Cloudflare Pages'},
          {icon:'🔥',title:'Firebase Auth',desc:'Secure authentication with OTP, NIN verification, and role-based access'},
          {icon:'💳',title:'Paystack + Stripe',desc:'Nigerian Naira and international payment processing'},
          {icon:'☁️',title:'Cloudflare Edge',desc:'Sub-100ms global response times via edge computing'},
          {icon:'🔒',title:'Enterprise Security',desc:'NDPR-compliant, SSL-secured, Model Armor I/O sanitization'}
        ] as tech}
          <div class="flex items-start gap-3 p-4 rounded-xl bg-cobalt/20">
            <span class="text-xl">{tech.icon}</span>
            <div>
              <div class="text-sm font-semibold text-white">{tech.title}</div>
              <div class="text-xs text-white/45">{tech.desc}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="text-center">
      <a href="/#pricing" class="btn-gold inline-flex items-center gap-2 px-8 py-4 text-sm">Get Started with SchoolCBT →</a>
    </div>
  </div>
</div>
