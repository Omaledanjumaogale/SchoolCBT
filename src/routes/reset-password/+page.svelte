<script lang="ts">
  import { sendPasswordReset } from '$lib/firebase'
  import { showToast } from '$lib/stores'

  let email = $state('')
  let isLoading = $state(false)
  let errorMsg = $state('')
  let success = $state(false)

  async function handleReset() {
    if (!email) {
      errorMsg = 'Please enter your email address.'
      return
    }
    isLoading = true
    errorMsg = ''
    try {
      await sendPasswordReset(email)
      success = true
      showToast('Password reset email sent! Check your inbox.')
    } catch (e: any) {
      errorMsg = e?.message ?? 'Failed to send reset email. Please try again.'
    } finally {
      isLoading = false
    }
  }
</script>

<svelte:head>
  <title>Reset Password — SchoolCBT</title>
  <meta name="description" content="Reset your SchoolCBT account password." />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-[#04091a] flex items-center justify-center pt-16 pb-16 px-4">
  <div class="glass-deep w-full max-w-md rounded-2xl p-8">
    {#if success}
      <div class="mb-6 text-center">
        <div class="text-5xl mb-4">📧</div>
        <h1 class="font-sora text-xl font-bold text-white mb-2">Check Your Email</h1>
        <p class="text-sm text-white/55 mb-6">
          We sent a password reset link to <strong class="text-gold">{email}</strong>. Check your
          inbox and spam folder.
        </p>
        <button onclick={() => (window.location.href = '/')} class="btn-gold w-full py-3 text-sm"
          >Back to SchoolCBT →</button
        >
      </div>
    {:else}
      <div class="mb-6 text-center">
        <div class="flex justify-center mb-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-cobalt-light to-cobalt"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              ><path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#FFD700"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg
            >
          </div>
        </div>
        <h1 class="font-sora text-xl font-bold text-white">Reset Your Password</h1>
        <p class="text-sm text-white/45 mt-1">Enter your email to receive a reset link</p>
      </div>

      {#if errorMsg}
        <div
          class="mb-4 rounded-xl border border-scarlet/20 bg-scarlet/10 p-3 text-xs text-scarlet"
        >
          {errorMsg}
        </div>
      {/if}

      <div class="space-y-4">
        <input
          type="email"
          bind:value={email}
          placeholder="Email Address"
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
      </div>
      <button
        onclick={handleReset}
        disabled={isLoading}
        class="btn-gold w-full py-3.5 text-sm mt-6 {isLoading
          ? 'opacity-60 cursor-not-allowed'
          : ''}"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link →'}
      </button>
      <div class="mt-4 text-center space-y-2">
        <a href="/" class="text-xs text-gold hover:underline block">← Back to SchoolCBT</a>
        <button onclick={() => {}} class="text-xs text-white/35 hover:text-gold underline block"
          >Need help? Contact support</button
        >
      </div>
    {/if}
  </div>
</div>
