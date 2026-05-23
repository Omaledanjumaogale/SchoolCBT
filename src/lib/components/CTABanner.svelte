<script lang="ts">
  import { showModal } from '$lib/stores';
</script>

<section class="relative overflow-hidden py-20">
  <div class="absolute inset-0" style="background:linear-gradient(135deg,rgba(0,51,153,0.55) 0%,rgba(0,20,60,0.8) 50%,rgba(80,200,120,0.12) 100%)"></div>
  <div class="absolute inset-0 bg-grid-subtle"></div>
  <div class="relative z-10 mx-auto max-w-4xl px-4 text-center">
    <div class="mb-5 text-6xl">🎓</div>
    <h2 class="font-sora mb-4 text-4xl font-extrabold text-white">Ready to <span class="text-gold">Guarantee</span> Your Results?</h2>
    <p class="mx-auto mb-8 max-w-2xl text-lg text-white/55">Join 50,000+ Nigerian students preparing smarter. Your JAMB, WAEC, or NECO success begins here.</p>
    <div class="flex flex-wrap justify-center gap-4">
      <button onclick={() => showModal('signup')} class="btn-gold px-8 py-4 text-base">Start Free Today →</button>
      <a href="#cbt-demo"   class="btn-outline px-8 py-4 text-base">Try CBT Demo First</a>
    </div>
    <p class="mt-5 text-xs text-white/30">✓ No credit card for demo · ✓ Mobile-ready · ✓ Nigerian Naira pricing</p>
  </div>
</section>
