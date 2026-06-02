<script lang="ts">
  import FeatureCard from './FeatureCard.svelte'

  const features = [
    {
      icon: '🎯',
      title: 'Intelligent CBT Engine',
      desc: '50-question batches dynamically generated per subject. 50s timer, ✅/❌ feedback, 2-point scoring.',
      prog: { pct: 87, color: 'jade', label: 'Pass Probability' },
    },
    {
      icon: '📊',
      title: 'AI Performance Analytics',
      desc: "Predictive pass probability, topic-level breakdown, Bloom's Taxonomy tagging, and hour tracking.",
    },
    {
      icon: '🏆',
      title: 'Awards & Star Ratings',
      desc: 'Earn achievement badges for 75%+ scores. Trophy system and daily streaks motivate daily prep.',
    },
    {
      icon: '👨‍🏫',
      title: 'AI Tutor Matching',
      desc: 'Automated assignment based on performance gaps. Tutors earn per subject, hour, and student.',
    },
    {
      icon: '📖',
      title: 'AI Study Plans',
      desc: 'Personalized timelines from uploaded academic reports. Kickstart Learning from dashboard.',
    },
    {
      icon: '📋',
      title: 'Automated Report Cards',
      desc: "WAEC-style grading (A1–F9), Bloom's tagging, and full explanations after every batch.",
    },
    {
      icon: '🤖',
      title: '5 Specialized AI Agents',
      desc: 'Coordinator, Intake, Researcher, Composer, and Evaluator — 90%+ curriculum grounding.',
    },
    {
      icon: '📱',
      title: '100% Mobile First',
      desc: 'Full CBT on any device, any time. No app download required — works in any browser.',
    },
    {
      icon: '🔐',
      title: 'Secure & Verified',
      desc: 'NIN verification, OTP auth, admin approval, and Model Armor I/O sanitization.',
    },
  ]
</script>

<section id="features" class="bg-mesh relative overflow-hidden py-24">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-14 text-center">
      <div class="sec-badge">Platform Features</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">
        Everything You Need to <span class="text-gold">Pass</span>
      </h2>
      <p class="mx-auto max-w-xl text-white/50">
        Nine powerful AI modules built specifically for Nigerian students. Results-guaranteed.
      </p>
    </div>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {#each features as f}
        <FeatureCard icon={f.icon} title={f.title} desc={f.desc} prog={f.prog} />
      {/each}
    </div>
  </div>
</section>
