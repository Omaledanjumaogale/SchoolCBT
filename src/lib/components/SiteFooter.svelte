<footer class="bg-cobalt-xdark border-t border-white/06 py-16">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5">
      <div class="col-span-2">
        <div class="mb-4 flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-gradient-to-br from-cobalt-light to-cobalt glow-gold">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-sora text-xl font-extrabold"><span class="text-white">School</span><span class="text-gold">CBT</span></span>
        </div>
        <p class="mb-4 text-sm leading-relaxed text-white/35">Nigeria's premier Results as a Service CBT platform for JAMB, WAEC, NECO &amp; NABTEB.</p>
        <div class="flex gap-3">
          {#each [{icon:'𝕏',label:'Twitter'},{icon:'in',label:'LinkedIn'},{icon:'f',label:'Facebook'}] as social}
            <a href="/" aria-label={social.label} class="glass hover:text-gold flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white/50 transition-colors">{social.icon}</a>
          {/each}
        </div>
      </div>
      {#each [
        {title:'Platform', links:['Features','CBT Demo','Pricing','Curriculum','Dashboard']},
        {title:'Exams',    links:['JAMB UTME','WAEC SSCE','NECO','NABTEB','POST-UTME']},
        {title:'Legal',    links:['Privacy Policy','Terms of Service','Refund Policy','Contact Us']}
      ] as col}
        <div>
          <div class="mb-4 text-sm font-semibold text-white">{col.title}</div>
          <div class="space-y-2.5">
            {#each col.links as link}
              <a href="/" class="block text-sm text-white/40 hover:text-white/70 transition-colors">{link}</a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="border-t border-white/06 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-xs text-white/25">© 2025 SchoolCBT Technologies Ltd. All rights reserved. Lagos, Nigeria.</p>
      <div class="flex gap-4 text-xs text-white/25">
        <span>🔒 SSL Secured</span><span>✓ NDPR Compliant</span><span>🇳🇬 Made in Nigeria</span>
      </div>
    </div>
  </div>
</footer>
