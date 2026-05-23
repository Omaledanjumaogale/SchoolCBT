<script lang="ts">
</script>

<svelte:head>
  <title>Reset Password — SchoolCBT</title>
  <meta name="description" content="Reset your SchoolCBT account password." />
</svelte:head>

<div class="min-h-screen bg-[#04091a] flex items-center justify-center pt-16 pb-16 px-4">
  <div class="glass-deep w-full max-w-md rounded-2xl p-8">
    <div class="mb-6 text-center">
      <div class="flex justify-center mb-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-cobalt-light to-cobalt">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <h1 class="font-sora text-xl font-bold text-white">Reset Your Password</h1>
      <p class="text-sm text-white/45 mt-1">Enter your email to receive a reset link</p>
    </div>
    <div class="space-y-4">
      <input type="email" placeholder="Email Address" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
    </div>
    <button class="btn-gold w-full py-3.5 text-sm mt-6">Send Reset Link →</button>
    <div class="mt-4 text-center">
      <a href="/" class="text-xs text-gold hover:underline">← Back to SchoolCBT</a>
    </div>
  </div>
</div>
