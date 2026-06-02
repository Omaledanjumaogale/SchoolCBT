<script lang="ts">
  import { ogMeta, jsonLDBreadcrumb } from '$lib/seo'
</script>

<svelte:head>
  <title>Curriculum Coverage — SchoolCBT | NERDC-Aligned Exam Preparation</title>
  <meta
    name="description"
    content="SchoolCBT covers JAMB, WAEC, NECO, and NABTEB curricula aligned with NERDC standards. All major subjects available with AI-generated questions."
  />
  <meta
    name="keywords"
    content="JAMB syllabus, WAEC curriculum, NECO subjects, NABTEB exam prep, NERDC curriculum, Nigerian exam preparation"
  />
  {@html ogMeta({
    title: 'Curriculum Coverage — SchoolCBT | NERDC-Aligned Exam Preparation',
    description:
      'SchoolCBT covers JAMB, WAEC, NECO, and NABTEB curricula aligned with NERDC standards. All major subjects available with AI-generated questions.',
    path: '/curriculum',
  })}
  {@html `<script type="application/ld+json">${jsonLDBreadcrumb([
    { name: 'Home', url: '/' },
    { name: 'Curriculum', url: '/curriculum' },
  ])}<\/script>`}
</svelte:head>

<div class="min-h-screen bg-[#04091a] pt-20 pb-16">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <div class="sec-badge">Curriculum Coverage</div>
      <h1 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">
        NERDC-Aligned <span class="text-gold">Examination Prep</span>
      </h1>
      <p class="mx-auto max-w-2xl text-white/50">
        All questions are grounded against the Nigerian Educational Research and Development Council
        (NERDC) approved curricula. Our AI achieves 90%+ grounding accuracy.
      </p>
    </div>

    <div class="glass-card p-8 mb-8">
      <h2 class="font-sora text-2xl font-bold text-white mb-6">Available Exam Types</h2>
      <div class="grid gap-4 md:grid-cols-2">
        {#each [{ label: 'JAMB UTME', sub: 'Joint Admissions and Matriculation Board', subjects: 'English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, CRS, Geography', color: 'text-gold', badge: 'JAMB' }, { label: 'WAEC SSCE', sub: 'West African Examinations Council', subjects: 'English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, Agricultural Science, Commerce, CRS, IRS, Yoruba, Hausa, Igbo, French, Technical Drawing, Food & Nutrition', color: 'text-jade', badge: 'WAEC' }, { label: 'NECO', sub: 'National Examinations Council', subjects: 'English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, Agricultural Science, Commerce, CRS, IRS', color: 'text-cobalt-100', badge: 'NECO' }, { label: 'NABTEB', sub: 'National Business and Technical Examinations Board', subjects: 'English, Mathematics, Physics, Chemistry, Biology, Technical Drawing, Basic Electricity, Building Construction, Auto Mechanics', color: 'text-scarlet', badge: 'NABTEB' }] as exam}
          <div class="border border-white/08 rounded-xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <span
                class="badge badge-{exam.badge === 'JAMB'
                  ? 'gold'
                  : exam.badge === 'WAEC'
                    ? 'jade'
                    : exam.badge === 'NECO'
                      ? 'blue'
                      : 'scarlet'}">{exam.badge}</span
              >
              <h3 class="font-sora text-xl font-bold text-white">{exam.label}</h3>
            </div>
            <p class="text-sm text-white/45 mb-3">{exam.sub}</p>
            <div class="text-xs text-white/60">
              Available subjects: <span class="text-white/40">{exam.subjects}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="glass-card p-8">
      <h2 class="font-sora text-2xl font-bold text-white mb-6">
        Question Grading by Bloom's Taxonomy
      </h2>
      <p class="text-white/50 mb-6">
        All questions are tagged with Bloom's Taxonomy levels, enabling AI to analyze your
        performance across cognitive domains.
      </p>
      <div class="grid gap-4 md:grid-cols-4">
        {#each [{ level: 'Knowledge', pct: 20, color: 'jade', desc: 'Recall of facts and basic concepts' }, { level: 'Comprehension', pct: 25, color: 'gold', desc: 'Understanding and interpretation' }, { level: 'Application', pct: 30, color: '#003399', desc: 'Using concepts in new situations' }, { level: 'Analysis', pct: 25, color: 'scarlet', desc: 'Breaking down and examining relationships' }] as bloom}
          <div class="stat-card p-5 text-center">
            <div class="text-2xl mb-2">🧠</div>
            <div class="text-sm font-semibold text-white mb-1">{bloom.level}</div>
            <div class="text-xs text-white/40">{bloom.desc}</div>
            <div class="mt-3 text-xs text-gold font-bold">{bloom.pct}% of questions</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
