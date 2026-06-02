<script lang="ts">
  import type { Snippet } from 'svelte'
  import { showModal } from '$lib/stores'
  let { cbtPanel }: { cbtPanel?: Snippet } = $props()
</script>

<section id="home" class="bg-hero relative min-h-screen overflow-hidden pt-16">
  <div class="orb orb-blue absolute" style="width:600px;height:600px;top:-100px;left:-80px"></div>
  <div
    class="orb orb-green absolute"
    style="width:350px;height:350px;bottom:100px;right:-60px;animation-delay:4s"
  ></div>

  <div class="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <!-- Left: Hero Text -->
      <div>
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-jade/30 bg-jade/10 px-4 py-1.5 text-xs font-semibold text-jade animate-fade-up"
        >
          <span class="pulse-dot h-2 w-2 rounded-full bg-jade inline-block"></span>
          Live Platform · 50,000+ Active Students
        </div>
        <h1
          class="font-sora mb-6 font-extrabold leading-tight tracking-tight text-white animate-fade-up"
          style="font-size:clamp(2.2rem,5vw,3.6rem)"
        >
          Nigeria's Premier<br />
          <span class="shimmer-text">Results as a Service</span><br />
          CBT Platform
        </h1>
        <p class="mb-8 max-w-lg text-base leading-relaxed text-white/55 animate-fade-up">
          Multi-agent AI generates personalized JAMB, WAEC, NECO &amp; NABTEB question batches
          grounded in Nigerian curricula. Predictive pass analytics, tutor matching, and automated
          report cards — all in one platform.
        </p>
        <div class="mb-10 flex flex-wrap gap-4 animate-fade-up">
          <button
            onclick={() => showModal('signup')}
            class="btn-gold flex items-center gap-2 px-7 py-3.5 text-sm">⚡ Start Free Today</button
          >
          <a href="#cbt-demo" class="btn-outline flex items-center gap-2 px-7 py-3.5 text-sm"
            >▶ Try Live Demo</a
          >
        </div>
        <div class="flex flex-wrap items-center gap-4 text-xs text-white/35">
          <div class="flex -space-x-2">
            {#each ['AO', 'CK', 'EM', 'TJ'] as init, i}
              <div
                class="avatar h-7 w-7 border-2 border-cobalt-xdark text-white {[
                  'bg-cobalt-light/60',
                  'bg-jade/40',
                  'bg-gold/40',
                  'bg-scarlet/40',
                ][i]}"
              >
                {init}
              </div>
            {/each}
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-cobalt/80 border-2 border-cobalt-xdark text-[9px] text-white/60"
            >
              +99k
            </div>
          </div>
          <span>Trusted by <strong class="text-white/60">50,000+</strong> Nigerian students</span>
          <span class="text-white/20">·</span>
          <span class="flex items-center gap-1"><span class="text-gold">★★★★★</span> 4.9/5</span>
        </div>
      </div>

      <!-- Right: Live CBT Panel -->
      <div>
        {#if cbtPanel}
          {@render cbtPanel()}
        {/if}
      </div>
    </div>

    <!-- Stats Row -->
    <div class="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
      {#each [{ val: '50K+', label: 'Students', color: 'text-gold' }, { val: '94%', label: 'Pass Rate', color: 'text-jade' }, { val: '1M+', label: 'Questions', color: 'text-white' }, { val: '240+', label: 'Tutors', color: 'text-cobalt-100' }] as s}
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-3xl font-extrabold {s.color}">{s.val}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">
            {s.label}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
