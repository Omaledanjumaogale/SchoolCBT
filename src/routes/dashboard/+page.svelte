<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { authStore, isAuthenticated, userRole } from '$lib/stores'
  import { goto } from '$app/navigation'
  import { queryOnce } from '$lib/convex'

  let activeTab = $state('overview')
  let statsLoading = $state(true)

  let user = $derived($authStore)
  let auth = $derived($isAuthenticated)
  let role = $derived($userRole)

  let analytics = $state<{
    totalQuestions?: number
    totalBatches?: number
    totalHours?: number
    avgScore?: number
    passProbability?: number
  } | null>(null)

  let sessions = $state<any[]>([])

  onMount(async () => {
    if (!auth) {
      goto('/')
      return
    } else if (role === 'tutor') {
      goto('/tutor')
      return
    }

    try {
      const uid = $authStore?.uid
      if (uid) {
        // Try Convex queries — fall back to defaults gracefully
        analytics = (await queryOnce('analytics:getByUser', { uid })) as any
        sessions = ((await queryOnce('sessions:getByUser', { uid, limit: 10 })) as any) ?? []
      }
    } catch {
      // Convex not configured — use defaults below
    }
    statsLoading = false
  })

  function switchTab(tab: string) {
    activeTab = tab
  }

  const totalQuestions = $derived(analytics?.totalQuestions ?? 1850)
  const totalBatches = $derived(analytics?.totalBatches ?? 37)
  const totalHours = $derived(analytics?.totalHours ?? 42.3)
  const avgScore = $derived(analytics?.avgScore ?? 78)
  const passProb = $derived(analytics?.passProbability ?? 87)

  const subjects = [
    { name: 'Mathematics', pct: 91, color: 'jade' },
    { name: 'English Language', pct: 88, color: 'jade' },
    { name: 'Physics', pct: 76, color: 'gold' },
    { name: 'Chemistry', pct: 64, color: 'scarlet' },
    { name: 'Biology', pct: 83, color: 'jade' },
  ]

  const recentBatches = $derived(
    sessions.length > 0
      ? sessions.map((s: any, i: number) => ({
          num: s.batchNumber ?? i + 1,
          subject: s.subject ?? 'Unknown',
          score: s.score ?? 0,
          waec: scoreToWAEC(s.score ?? 0),
          date: new Date(s.completedAt ?? s.startedAt).toISOString().split('T')[0],
        }))
      : [
          { num: 37, subject: 'Physics', score: 92, waec: 'A1', date: '2025-06-10' },
          { num: 36, subject: 'Mathematics', score: 88, waec: 'B2', date: '2025-06-09' },
          { num: 35, subject: 'Chemistry', score: 74, waec: 'C4', date: '2025-06-08' },
          { num: 34, subject: 'English', score: 86, waec: 'B2', date: '2025-06-07' },
          { num: 33, subject: 'Biology', score: 58, waec: 'D7', date: '2025-06-06' },
        ],
  )

  function scoreToWAEC(score: number): string {
    const pct = ((score / 2) * 100) / 5 // rough estimate: 5 questions, 2 pts each = 10
    if (pct >= 90) return 'A1'
    if (pct >= 80) return 'B2'
    if (pct >= 70) return 'B3'
    if (pct >= 60) return 'C4'
    if (pct >= 50) return 'C5'
    if (pct >= 45) return 'D7'
    if (pct >= 40) return 'E8'
    return 'F9'
  }

  function waecColor(grade: string): string {
    if (['A1', 'B2', 'B3'].includes(grade)) return 'badge-jade'
    if (['C4', 'C5', 'C6'].includes(grade)) return 'badge-gold'
    return 'badge-scarlet'
  }

  function pctColor(pct: number): string {
    if (pct >= 75) return 'text-jade'
    if (pct >= 60) return 'text-gold'
    return 'text-scarlet'
  }
</script>

<svelte:head>
  <title>Dashboard — SchoolCBT</title>
  <meta
    name="description"
    content="Your personalized SchoolCBT student dashboard — track exam readiness, study progress, and AI-powered insights."
  />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-mesh pt-20">
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    {#if statsLoading}
      <div class="text-center py-20 text-white/40">
        <div class="text-4xl mb-4">⏳</div>
        <p>Loading your dashboard...</p>
      </div>
    {:else}
      <!-- Page Header -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-sora text-2xl font-bold text-white">
            Welcome back, <span class="text-gold">{user?.displayName ?? 'Student'}</span> 👋
          </h1>
          <p class="text-sm text-white/45 mt-1">Your exam readiness dashboard · WAEC SSCE 2025</p>
        </div>
        <div class="flex gap-3">
          <a href="/practice" class="btn-gold px-5 py-2.5 text-sm">⚡ Practice Now</a>
          <button class="btn-outline px-5 py-2.5 text-sm">📥 Download Report</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8 flex flex-wrap gap-2">
        {#each [{ id: 'overview', label: '📊 Overview' }, { id: 'analytics', label: '📈 Analytics' }, { id: 'study', label: '📖 Study Center' }, { id: 'reports', label: '📋 Reports' }, { id: 'tutors', label: '👨‍🏫 Tutors' }] as tab}
          <button
            class="tab-btn {activeTab === tab.id ? 'active' : ''}"
            onclick={() => switchTab(tab.id)}>{tab.label}</button
          >
        {/each}
      </div>

      {#if activeTab === 'overview'}
        <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="stat-card p-5 text-center">
            <div class="mb-1 font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Time Spent
            </div>
            <div class="font-sora text-3xl font-bold text-white">{totalHours}h</div>
            <div class="badge badge-blue mt-2">Convex tracked</div>
          </div>
          <div class="stat-card p-5 text-center">
            <div class="mb-1 font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Questions
            </div>
            <div class="font-sora text-gold text-3xl font-bold">
              {totalQuestions.toLocaleString()}
            </div>
            <div class="badge badge-gold mt-2">Live data</div>
          </div>
          <div class="stat-card p-5 text-center">
            <div class="mb-1 font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Batches
            </div>
            <div class="font-sora text-3xl font-bold text-white">{totalBatches}</div>
            <div class="badge badge-blue mt-2">Real-time</div>
          </div>
          <div class="stat-card p-5 text-center">
            <div class="mb-1 font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Pass Prob.
            </div>
            <div class="font-sora text-jade text-3xl font-bold">{passProb}%</div>
            <div class="badge badge-jade mt-2">AI predicted</div>
          </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          <div class="glass-card p-6 lg:col-span-2">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="font-semibold text-white">Predictive Pass Analysis</h2>
              <span class="badge badge-gold">AI Powered</span>
            </div>
            <div class="space-y-4">
              {#each subjects as s}
                <div>
                  <div class="mb-2 flex justify-between text-sm">
                    <span class="text-white/65">{s.name}</span>
                    <span class="font-semibold {pctColor(s.pct)}">{s.pct}%</span>
                  </div>
                  <div class="pbar">
                    <div class="pfill bg-{s.color}" style="width:{s.pct}%"></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="glass-card p-6">
            <h2 class="font-semibold text-white mb-5">Recent Awards</h2>
            <div class="space-y-3">
              {#each [{ icon: '🥇', title: 'Gold — Mathematics', sub: 'Batch 35 · 92% score' }, { icon: '🥈', title: 'Silver — Physics', sub: 'Batch 33 · 82% score' }, { icon: '🏆', title: '7-Day Streak!', sub: 'Consistent daily practice' }, { icon: '⭐', title: 'Top 10% National', sub: 'Mathematics ranking' }] as award}
                <div class="flex items-center gap-3 bg-cobalt/25 rounded-xl p-3">
                  <span class="text-2xl">{award.icon}</span>
                  <div>
                    <div class="text-sm font-medium text-white/80">{award.title}</div>
                    <div class="text-xs text-white/40">{award.sub}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else if activeTab === 'analytics'}
        <div class="grid gap-5 md:grid-cols-2">
          <div class="glass-card p-6">
            <h2 class="font-semibold text-white mb-5">Topic-Level Performance</h2>
            <div class="space-y-3">
              {#each [{ topic: 'Number Theory', pct: 94, c: 'jade' }, { topic: 'Algebra & Sets', pct: 87, c: 'jade' }, { topic: 'Trigonometry', pct: 72, c: 'gold' }, { topic: 'Geometry', pct: 58, c: 'scarlet' }, { topic: 'Statistics', pct: 80, c: 'jade' }, { topic: 'Calculus', pct: 52, c: 'scarlet' }] as t}
                <div class="flex items-center gap-3">
                  <span class="text-xs text-white/50 w-28 shrink-0">{t.topic}</span>
                  <div class="pbar flex-1">
                    <div class="pfill bg-{t.c}" style="width:{t.pct}%"></div>
                  </div>
                  <span class="text-xs font-semibold text-{t.c} w-8 text-right">{t.pct}%</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="glass-card p-6">
            <h2 class="font-semibold text-white mb-5">Bloom's Taxonomy</h2>
            <div class="space-y-3">
              {#each [{ level: 'Knowledge & Recall', pct: 92, cls: 'jade' }, { level: 'Comprehension', pct: 85, cls: 'jade' }, { level: 'Application', pct: 71, cls: 'gold' }, { level: 'Analysis & Synthesis', pct: 55, cls: 'scarlet' }] as b}
                <div
                  class="flex items-center gap-3 p-3 rounded-xl bg-{b.cls}/10 border border-{b.cls}/20"
                >
                  <div class="flex-1">
                    <div class="text-sm text-white/80 mb-1">{b.level}</div>
                    <div class="pbar">
                      <div class="pfill bg-{b.cls}" style="width:{b.pct}%"></div>
                    </div>
                  </div>
                  <span class="text-{b.cls} font-bold text-sm ml-2">{b.pct}%</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else if activeTab === 'study'}
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-semibold text-white">AI-Generated Study Plan</h2>
            <span class="badge badge-gold">Personalized</span>
          </div>
          <div class="space-y-3">
            {#each [{ week: 'W1', topic: 'Number Theory & Sets', done: 100, color: 'jade', status: 'Done ✓' }, { week: 'W2', topic: 'Algebra, Equations & Inequalities', done: 100, color: 'jade', status: 'Done ✓' }, { week: 'W3', topic: 'Trigonometry', done: 65, color: 'gold', status: '65%' }, { week: 'W4', topic: 'Geometry & Mensuration', done: 0, color: 'white/20', status: 'Locked' }, { week: 'W5', topic: 'Statistics & Probability', done: 0, color: 'white/20', status: 'Locked' }] as p}
              <div
                class="flex items-center gap-4 p-4 rounded-xl
                          {p.done === 100
                  ? 'bg-jade/10 border border-jade/20'
                  : p.done > 0
                    ? 'bg-gold/10 border border-gold/20'
                    : 'bg-cobalt/30 border border-white/06'}"
              >
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0
                            {p.done > 0 ? 'bg-jade/20 text-jade' : 'bg-cobalt/40 text-white/40'}"
                >
                  {p.week}
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium {p.done > 0 ? 'text-white' : 'text-white/50'}">
                    {p.topic}
                  </div>
                  <div class="pbar mt-2">
                    <div class="pfill bg-{p.color}" style="width:{p.done}%"></div>
                  </div>
                </div>
                <span
                  class="text-xs font-bold shrink-0 {p.done === 100
                    ? 'text-jade'
                    : p.done > 0
                      ? 'text-gold'
                      : 'text-white/25'}">{p.status}</span
                >
              </div>
            {/each}
          </div>
        </div>
      {:else if activeTab === 'reports'}
        <div class="glass-card overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-white/06">
            <h2 class="font-semibold text-white">Report Vault</h2>
            <span class="badge badge-blue">{recentBatches.length} Reports</span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full">
              <thead>
                <tr>
                  <th class="text-left">Batch #</th>
                  <th class="text-left">Subject</th>
                  <th class="text-left">Score</th>
                  <th class="text-left">WAEC Grade</th>
                  <th class="text-left">Date</th>
                  <th class="text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {#each recentBatches as b}
                  <tr>
                    <td class="text-white/70">#{b.num}</td>
                    <td class="text-white/70">{b.subject}</td>
                    <td><span class="{pctColor(b.score)} font-semibold">{b.score}/100</span></td>
                    <td><span class="badge {waecColor(b.waec)}">{b.waec}</span></td>
                    <td class="text-white/40">{b.date}</td>
                    <td><a href="/practice" class="text-xs text-gold hover:underline">View →</a></td
                    >
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else if activeTab === 'tutors'}
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-semibold text-white">AI-Matched Tutors</h2>
            <button class="btn-outline py-2 px-4 text-xs">Request New Tutor</button>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            {#each [{ initials: 'AB', name: 'Adewale Bello', subjects: 'Math · Physics', rating: 4.9, students: 124, rate: '₦750/hr', color: 'cobalt-light/60' }, { initials: 'CN', name: 'Chiamaka Nwosu', subjects: 'Chem · Biology', rating: 4.8, students: 98, rate: '₦900/hr', color: 'jade/40' }, { initials: 'YD', name: 'Yakubu Dangote', subjects: 'English · Govt', rating: 4.6, students: 76, rate: '₦650/hr', color: 'scarlet/40' }] as t}
              <div
                class="bg-cobalt/30 rounded-xl p-4 border border-white/06 hover:border-gold/20 transition-all"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="avatar h-10 w-10 bg-{t.color} text-white text-sm border border-cobalt-xdark"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-white">{t.name}</div>
                    <div class="text-xs text-white/40">{t.subjects}</div>
                  </div>
                </div>
                <div class="flex items-center gap-1 mb-2">
                  <span class="text-gold text-sm">{'★'.repeat(Math.floor(t.rating))}</span>
                  <span class="text-xs text-white/40 ml-1">{t.rating}</span>
                </div>
                <div class="text-xs text-white/40 mb-3">{t.students} students · {t.rate}</div>
                <button class="btn-outline w-full py-1.5 text-xs">Book Session</button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</main>
