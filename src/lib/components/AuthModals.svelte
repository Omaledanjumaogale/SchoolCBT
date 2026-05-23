<script lang="ts">
  let { signupOpen = $bindable(false), loginOpen = $bindable(false) }: {
    signupOpen?: boolean;
    loginOpen?: boolean;
  } = $props();

  let signupRole = $state<'student'|'tutor'>('student');

  function closeAll() { signupOpen = false; loginOpen = false; }
  function submitSignup() { closeAll(); }
  function submitLogin() { closeAll(); }
  function switchToLogin() { signupOpen = false; loginOpen = true; }
  function switchToSignup() { loginOpen = false; signupOpen = true; }
</script>

{#if signupOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
  <div class="modal-overlay open" onclick={(e) => e.target === e.currentTarget && closeAll()} role="dialog" aria-modal="true">
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-sora text-xl font-bold text-white">Create Your Account</h2>
          <p class="text-sm text-white/45 mt-0.5">Join 50,000+ Nigerian students</p>
        </div>
        <button onclick={closeAll} class="glass h-8 w-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
      </div>
      <div class="flex gap-1 bg-cobalt-xdark/50 rounded-xl p-1 mb-5">
        <button onclick={() => signupRole = 'student'} class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole==='student' ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold' : 'font-medium text-white/50'}">🎓 Student</button>
        <button onclick={() => signupRole = 'tutor'} class="flex-1 py-2 rounded-lg text-sm transition-all {signupRole==='tutor' ? 'font-semibold bg-cobalt/60 border border-gold/25 text-gold' : 'font-medium text-white/50'}">👨‍🏫 Tutor</button>
      </div>
      <div class="space-y-4">
        <input type="text" placeholder="Full Name" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="email" placeholder="Email Address" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="tel" placeholder="Phone Number" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        {#if signupRole === 'student'}
          <select class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white/70 focus:border-gold/50 focus:outline-none appearance-none">
            <option value="">Select Target Exam</option>
            <option>JAMB UTME</option><option>WAEC SSCE</option><option>NECO</option><option>NABTEB</option>
          </select>
        {/if}
        <input type="password" placeholder="Create Password" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
      </div>
      <button onclick={submitSignup} class="btn-gold w-full py-3.5 text-sm mt-6">Create Account →</button>
      <p class="mt-4 text-center text-xs text-white/35">Have an account? <button onclick={switchToLogin} class="text-gold hover:underline">Log in</button></p>
    </div>
  </div>
{/if}

{#if loginOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
  <div class="modal-overlay open" onclick={(e) => e.target === e.currentTarget && closeAll()} role="dialog" aria-modal="true">
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="font-sora text-xl font-bold text-white">Welcome Back</h2>
          <p class="text-sm text-white/45 mt-0.5">Log in to SchoolCBT</p>
        </div>
        <button onclick={closeAll} class="glass h-8 w-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
      </div>
      <div class="space-y-4">
        <input type="email" placeholder="Email" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
        <input type="password" placeholder="Password" class="w-full rounded-xl border border-white/10 bg-cobalt-xdark/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none" />
      </div>
      <div class="flex justify-end mt-2 mb-4">
        <a href="/reset-password" class="text-xs text-gold hover:underline">Forgot password?</a>
      </div>
      <button onclick={submitLogin} class="btn-gold w-full py-3.5 text-sm">Log In</button>
      <p class="mt-4 text-center text-xs text-white/35">No account? <button onclick={switchToSignup} class="text-gold hover:underline">Sign up free</button></p>
    </div>
  </div>
{/if}
