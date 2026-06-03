<script lang="ts">
  import { registerUser, loginUser, logoutUser, auth } from '$lib/firebase'
  import { authStore, showToast, showModal, hideModals, uiStore } from '$lib/stores'
  import { executeMutation } from '$lib/convex'

  let signupOpen = $state(false)
  let loginOpen = $state(false)

  uiStore.subscribe(s => {
    signupOpen = s.signupModal
    loginOpen = s.loginModal
  })

  let signupRole = $state<'student' | 'tutor'>('student')
  let signupName = $state('')
  let signupEmail = $state('')
  let signupPhone = $state('')
  let signupPassword = $state('')
  let signupExam = $state('')
  let loginEmail = $state('')
  let loginPassword = $state('')
  let isLoading = $state(false)
  let errorMsg = $state('')

  function closeAll() {
    signupOpen = false
    loginOpen = false
    hideModals() // sync store so layout subscription doesn't reopen
    errorMsg = ''
  }

  function switchToLogin() {
    signupOpen = false
    loginOpen = true
    errorMsg = ''
  }
  function switchToSignup() {
    loginOpen = false
    signupOpen = true
    errorMsg = ''
  }

  async function submitSignup() {
    if (!signupName || !signupEmail || !signupPassword) {
      errorMsg = 'Please fill all required fields.'
      return
    }
    if (signupPassword.length < 6) {
      errorMsg = 'Password must be at least 6 characters.'
      return
    }
    isLoading = true
    errorMsg = ''
    try {
      const user = await registerUser(signupEmail, signupPassword, signupName, signupRole)

      // Sync user profile to Convex in real time
      await executeMutation('users:sync', {
        uid: user.uid,
        email: user.email ?? signupEmail,
        displayName: signupName,
        role: signupRole,
        phone: signupPhone || undefined,
        targetExam: signupRole === 'student' ? signupExam : undefined,
      }).catch(err => console.error('Convex user sync error:', err))

      authStore.login({
        uid: user.uid,
        email: user.email ?? signupEmail,
        displayName: signupName,
        role: signupRole,
        photoURL: user.photoURL ?? undefined,
      })
      showToast('Account created! Check your email for verification.')
      closeAll()
      // Reset form
      signupName = ''
      signupEmail = ''
      signupPhone = ''
      signupPassword = ''
      signupExam = ''
    } catch (e: any) {
      errorMsg = e?.message ?? 'Signup failed. Please try again.'
    } finally {
      isLoading = false
    }
  }

  async function submitLogin() {
    if (!loginEmail || !loginPassword) {
      errorMsg = 'Please enter your email and password.'
      return
    }
    isLoading = true
    errorMsg = ''
    try {
      const user = await loginUser(loginEmail, loginPassword)
      authStore.login({
        uid: user.uid,
        email: user.email ?? loginEmail,
        displayName: user.displayName ?? 'User',
        role: 'student',
        photoURL: user.photoURL ?? undefined,
      })
      showToast(
        `Welcome back${user.displayName ? ', ' + user.displayName : ''}! Redirecting to dashboard...`,
      )
      closeAll()
      loginEmail = ''
      loginPassword = ''
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 800)
    } catch (e: any) {
      const code = e?.code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password.'
      } else if (code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again later.'
      } else {
        errorMsg = e?.message ?? 'Login failed. Please try again.'
      }
    } finally {
      isLoading = false
    }
  }
</script>

{#if signupOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="modal-overlay open"
    onclick={e => e.target === e.currentTarget && closeAll()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-sora text-xl font-bold text-white">Create Your Account</h2>
          <p class="text-sm text-white/45 mt-0.5">Join 50,000+ Nigerian students</p>
        </div>
        <button
          onclick={closeAll}
          class="glass h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-white/60 hover:text-white"
          >✕</button
        >
      </div>
      <div class="flex gap-1 bg-cobalt-xdark/50 rounded-xl p-1 mb-5">
        <button
          onclick={() => (signupRole = 'student')}
          class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole === 'student'
            ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold'
            : 'font-medium text-white/50'}">🎓 Student</button
        >
        <button
          onclick={() => (signupRole = 'tutor')}
          class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole === 'tutor'
            ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold'
            : 'font-medium text-white/50'}">👨‍🏫 Tutor</button
        >
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
          type="text"
          bind:value={signupName}
          placeholder="Full Name"
          required
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
        <input
          type="email"
          bind:value={signupEmail}
          placeholder="Email Address"
          required
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
        <input
          type="tel"
          bind:value={signupPhone}
          placeholder="Phone Number"
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
        {#if signupRole === 'student'}
          <select
            bind:value={signupExam}
            class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white/70 focus:border-gold/50 focus:outline-none appearance-none"
          >
            <option value="">Select Target Exam</option>
            <option>JAMB UTME</option><option>WAEC SSCE</option><option>NECO</option><option
              >NABTEB</option
            >
          </select>
        {/if}
        <input
          type="password"
          bind:value={signupPassword}
          placeholder="Create Password (min 6 chars)"
          required
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
      </div>
      <button
        onclick={submitSignup}
        disabled={isLoading}
        class="btn-gold w-full py-3.5 text-sm mt-6 {isLoading
          ? 'opacity-60 cursor-not-allowed'
          : ''}"
      >
        {isLoading ? 'Creating Account...' : 'Create Account →'}
      </button>
      <p class="mt-4 text-center text-xs text-white/35">
        Have an account? <button onclick={switchToLogin} class="text-gold hover:underline"
          >Log in</button
        >
      </p>
    </div>
  </div>
{/if}

{#if loginOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="modal-overlay open"
    onclick={e => e.target === e.currentTarget && closeAll()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-sora text-xl font-bold text-white">Welcome Back</h2>
          <p class="text-sm text-white/45 mt-0.5">Log in to SchoolCBT</p>
        </div>
        <button
          onclick={closeAll}
          class="glass h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-white/60 hover:text-white"
          >✕</button
        >
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
          bind:value={loginEmail}
          placeholder="Email"
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
        <input
          type="password"
          bind:value={loginPassword}
          placeholder="Password"
          class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none"
        />
      </div>
      <div class="flex justify-between mt-2 mb-4">
        <label class="flex items-center gap-2 text-xs text-white/40"
          ><input type="checkbox" class="accent-gold rounded" /> Remember me</label
        >
        <a href="/reset-password" class="text-xs text-gold hover:underline">Forgot password?</a>
      </div>
      <button
        onclick={submitLogin}
        disabled={isLoading}
        class="btn-gold w-full py-3.5 text-sm {isLoading ? 'opacity-60 cursor-not-allowed' : ''}"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
      <p class="mt-4 text-center text-xs text-white/35">
        No account? <button onclick={switchToSignup} class="text-gold hover:underline"
          >Sign up free</button
        >
      </p>
    </div>
  </div>
{/if}
