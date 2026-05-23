<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated, userRole } from '$lib/stores';
  import { goto } from '$app/navigation';

  onMount(() => {
    if (!$isAuthenticated) goto('/');
    else if ($userRole === 'student') goto('/dashboard');
  });
</script>

<svelte:head>
  <title>Tutor Dashboard — SchoolCBT | Earn as You Teach</title>
  <meta name="description" content="SchoolCBT tutor dashboard. Manage your sessions, track earnings, view student performance. Join 240+ verified tutors." />
</svelte:head>

<div class="min-h-screen bg-[#04091a] pt-20 pb-16">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div class="mb-10 text-center">
      <div class="sec-badge">Tutor Portal</div>
      <h1 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">Your <span class="text-gold">Teaching</span> Dashboard</h1>
      <p class="mx-auto max-w-2xl text-white/50">A complete tutor management system: track students, manage sessions, view earnings, and grow your teaching portfolio.</p>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
      {#each [
        {val:'12', label:'Active Students',   color:'text-gold', badge:'↑ 3 this month'},
        {val:'48', label:'Sessions Completed', color:'text-jade', badge:'4.8 avg rating'},
        {val:'₦156,000', label:'Total Earnings', color:'text-white', badge:'Paid weekly'},
        {val:'94%', label:'Student Pass Rate', color:'text-jade', badge:'Top 10% tutor'}
      ] as s}
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-2xl font-extrabold {s.color}">{s.val}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">{s.label}</div>
          <div class="badge badge-blue mt-2">{s.badge}</div>
        </div>
      {/each}
    </div>

    <div class="glass-card p-6 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="text-xs font-mono text-white/40 mb-1">EARNINGS WALLET</div>
          <div class="font-sora text-3xl font-extrabold text-gold">₦156,000</div>
          <div class="text-sm text-white/45 mt-1">Available for withdrawal</div>
        </div>
        <div class="flex gap-3">
          <button class="btn-gold py-3 px-6 text-sm">Withdraw Funds</button>
          <button class="btn-outline py-3 px-6 text-sm">View History</button>
        </div>
      </div>
    </div>

    <div class="glass-card p-6">
      <h2 class="font-sora text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
      <div class="text-center py-12 text-white/35">
        <div class="text-4xl mb-3">📅</div>
        <p>Session management will be available with full tutor tools.<br/>Your profile is being reviewed for platform access.</p>
        <a href="#features" class="inline-block mt-4 text-gold hover:underline text-sm">Learn about tutor features →</a>
      </div>
    </div>
  </div>
</div>
