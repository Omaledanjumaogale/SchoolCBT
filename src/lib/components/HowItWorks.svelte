<section id="how-it-works" class="relative overflow-hidden py-24">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-16 text-center">
      <div class="sec-badge">Process</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">How <span class="text-gold">SchoolCBT</span> Works</h2>
      <p class="mx-auto max-w-xl text-white/50">From sign-up to exam readiness in four intelligent steps, powered by multi-agent AI.</p>
    </div>

    <div class="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {#each [
        {num:1, title:'Sign Up & Profile', desc:'Create your account, submit personal details, school info, and upload academic reports for AI personalization.'},
        {num:2, title:'AI Setup', desc:'Multi-agent system analyzes your profile, grounding questions against Nigerian curricula and your target exam goals.'},
        {num:3, title:'Take CBT Exams', desc:'50-question batches, 50s timer per question, instant feedback. Track scores and earn awards for high performance.'},
        {num:4, title:'Track & Improve', desc:'Review AI report cards, follow study plans, request tutor support, and watch your pass probability grow.'}
      ] as step}
        <div class="glass-card relative z-10 p-6 text-center">
          <div class="step-connector"></div>
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 bg-gradient-to-br from-cobalt-light to-cobalt font-sora text-xl font-bold text-gold">{step.num}</div>
          <h3 class="font-semibold mb-2 text-white">{step.title}</h3>
          <p class="text-sm text-white/50">{step.desc}</p>
        </div>
      {/each}
    </div>

    <!-- AI Agents Info Card -->
    <div class="glass-card mt-16 p-8">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div>
          <div class="sec-badge">Multi-Agent AI Engine</div>
          <h3 class="font-sora font-bold mt-3 mb-4 text-2xl text-white">Powered by 5 Specialized AI Agents</h3>
          <p class="mb-6 text-sm leading-relaxed text-white/55">Our proprietary RaaS engine orchestrates intelligent agents that work in concert to generate, validate, and deliver curriculum-accurate examination content with >90% grounding accuracy.</p>
          <div class="space-y-3">
            {#each [
              {icon:'🎯', title:'Coordinator Agent', desc:'Orchestrates all agents and manages student intake flow'},
              {icon:'📥', title:'Intake Agent', desc:'Extracts student level, subjects, and exam goals from reports'},
              {icon:'🔬', title:'Researcher Agent', desc:'Pulls from Nigerian curricula RAG system with verified content'},
              {icon:'✍️', title:'Question Composer', desc:'Generates randomized 50-question batches using COSTAR method', gold:true},
              {icon:'✅', title:'Quality Evaluator', desc:'Ensures 90%+ grounding accuracy against West African curriculum', jade:true}
            ] as agent}
              <div class="flex items-start gap-3 flex-wrap">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border {agent.gold ? 'border-gold/30 bg-gold/10' : agent.jade ? 'border-jade/30 bg-jade/10' : 'border-cobalt-light/50 bg-cobalt/60'} text-xs">{agent.icon}</span>
                <div>
                  <div class="text-sm font-medium text-white/80">{agent.title}</div>
                  <div class="text-xs text-white/40">{agent.desc}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
        <div class="space-y-4">
          {#each [
            {icon:'🎓', title:'Google Vertex AI', desc:'Gemini 1.5 Pro multimodal reasoning'},
            {icon:'⚡', title:'Vertex AI Agent Builder', desc:'Scalable agentic workflow runtime'},
            {icon:'💳', title:'Stripe + Paystack', desc:'Naira payments & tutor wallet'},
            {icon:'🔥', title:'Firebase Auth', desc:'OTP, NIN verification, SSO'},
            {icon:'☁️', title:'Cloudflare Pages', desc:'Edge-deployed, <100ms globally'}
          ] as tech}
            <div class="stat-card flex items-center gap-4 p-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cobalt/60 text-lg">{tech.icon}</div>
              <div>
                <div class="font-semibold text-white">{tech.title}</div>
                <div class="text-xs text-white/45">{tech.desc}</div>
              </div>
              <div class="badge badge-jade ml-auto">Active</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
