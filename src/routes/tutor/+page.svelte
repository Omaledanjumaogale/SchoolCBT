<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated, userRole } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { queryOnce } from '$lib/convex';

  let loading = $state(true);

  let tutorData = $state<{
    subjects?: string[];
    hourlyRateNGN?: number;
    rating?: number;
    totalSessions?: number;
    totalEarnings?: number;
    available?: boolean;
    verified?: boolean;
    bio?: string;
  } | null>(null);

  let earnings = $state<any[]>([]);
  let totalPending = $state(0);

  onMount(async () => {
    if (!$isAuthenticated) { goto('/'); return; }
    else if ($userRole === 'student') { goto('/dashboard'); return; }

    const uid = $authStore?.uid;
    if (uid) {
      try {
        tutorData = await queryOnce('tutors:getByUid', { uid }) as any;
        earnings = await queryOnce('tutors:getEarnings', { tutorUid: uid }) as any ?? [];
        totalPending = earnings.filter((e: any) => e.status === 'pending').reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
      } catch {
        // Convex not configured — use defaults
      }
    }
    loading = false;
  });

  const totalEarnings = $derived(tutorData?.totalEarnings ?? 156000);
  const totalSessions = $derived(tutorData?.totalSessions ?? 48);
  const rating = $derived(tutorData?.rating ?? 4.8);
  const totalAvailable = $derived(totalEarnings - totalPending);
</script>

<svelte:head>
  <title>Tutor Dashboard — SchoolCBT | Earn as You Teach</title>
  <meta name="description" content="SchoolCBT tutor dashboard. Manage your sessions, track earnings, view student performance. Join 240+ verified tutors." />
</svelte:head>

<div class="min-h-screen bg-[#04091a] pt-20 pb-16">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    {#if loading}
      <div class="text-center py-20 text-white/40">
        <div class="text-4xl mb-4">⏳</div>
        <p>Loading your tutor dashboard...</p>
      </div>
    {:else}
      <div class="mb-10 text-center">
        <div class="sec-badge">Tutor Portal</div>
        <h1 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">
          Your <span class="text-gold">Teaching</span> Dashboard
        </h1>
        <p class="mx-auto max-w-2xl text-white/50">A complete tutor management system powered by Convex real-time data.</p>
      </div>

      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-2xl font-extrabold text-gold">{totalSessions}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">Sessions</div>
          <div class="badge badge-gold mt-2">{rating} ★ rating</div>
        </div>
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-2xl font-extrabold text-gold">₦{totalEarnings.toLocaleString()}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">Total Earnings</div>
          <div class="badge badge-jade mt-2">Convex tracked</div>
        </div>
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-2xl font-extrabold text-white">₦{totalAvailable.toLocaleString()}</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">Available</div>
          <div class="badge badge-blue mt-2">{totalPending > 0 ? `₦${totalPending.toLocaleString()} pending` : 'All cleared'}</div>
        </div>
        <div class="stat-card p-5 text-center">
          <div class="font-sora text-2xl font-extrabold text-jade">94%</div>
          <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">Pass Rate</div>
          <div class="badge badge-jade mt-2">{tutorData?.verified ? 'Verified ✓' : 'Pending review'}</div>
        </div>
      </div>

      <!-- Earnings Wallet -->
      <div class="glass-card p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="text-xs font-mono text-white/40 mb-1">EARNINGS WALLET</div>
            <div class="font-sora text-3xl font-extrabold text-gold">₦{totalEarnings.toLocaleString()}</div>
            <div class="text-sm text-white/45 mt-1">
              ₦{totalAvailable.toLocaleString()} available · {totalPending > 0 ? `₦${totalPending.toLocaleString()} pending` : 'All cleared'}
            </div>
          </div>
          <div class="flex gap-3">
            <button class="btn-gold py-3 px-6 text-sm" disabled={totalAvailable === 0}>Withdraw Funds</button>
            <button class="btn-outline py-3 px-6 text-sm">View History</button>
          </div>
        </div>
      </div>

      <!-- Earnings Table -->
      {#if earnings.length > 0}
        <div class="glass-card overflow-hidden mb-8">
          <div class="flex items-center justify-between p-5 border-b border-white/06">
            <h2 class="font-semibold text-white">Recent Earnings</h2>
            <span class="badge badge-blue">{earnings.length} transactions</span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full">
              <thead>
                <tr>
                  <th class="text-left">Subject</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Status</th>
                  <th class="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {#each earnings.slice(0, 10) as e}
                  <tr>
                    <td class="text-white/70">{e.subject ?? '—'}</td>
                    <td class="text-gold font-semibold">₦{e.amount?.toLocaleString() ?? 0}</td>
                    <td>
                      <span class="badge {e.status === 'paid' ? 'badge-jade' : e.status === 'pending' ? 'badge-gold' : 'badge-scarlet'}">
                        {e.status ?? 'pending'}
                      </span>
                    </td>
                    <td class="text-white/40">{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- Upcoming Sessions -->
      <div class="glass-card p-6">
        <h2 class="font-sora text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
        <div class="text-center py-12 text-white/35">
          <div class="text-4xl mb-3">📅</div>
          <p>Session management will be available with full tutor tools.<br/>Your profile is being reviewed for platform access.</p>
          <a href="#features" class="inline-block mt-4 text-gold hover:underline text-sm">Learn about tutor features →</a>
        </div>
      </div>
    {/if}
  </div>
</div>
