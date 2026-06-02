<svelte:head>
  <title>Security — SchoolCBT</title>
  <meta
    name="description"
    content="SchoolCBT security, data protection, and responsible disclosure overview."
  />
</svelte:head>

<main class="min-h-screen bg-mesh pt-24">
  <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <div class="sec-badge">Trust Center</div>
      <h1 class="font-sora mt-3 text-4xl font-bold text-white">Security & Compliance</h1>
      <p class="mt-3 max-w-2xl text-sm text-white/50">
        Operational safeguards for student data, payments, tutor workflows, and AI-assisted
        learning.
      </p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      {#each [['Access Control', 'Server-side session cookies, role checks, and Convex ownership checks protect dashboard and session data.'], ['Payment Safety', 'Live payment flows fail closed when provider credentials are missing and verify transactions before subscription activation.'], ['Rate Limiting', 'AI generation is protected by a fixed-window limiter with Cloudflare KV support for production.'], ['Auditability', 'Payment references, session attempts, timestamps, and analytics updates are persisted for operational review.'], ['Student Data', 'Privacy, retention, export, and deletion expectations are documented for students, parents, and schools.'], ['Responsible Disclosure', 'Security issues can be reported to support for triage, containment, remediation, and post-incident review.']] as item}
        <article class="glass-card p-5">
          <h2 class="font-sora mb-2 text-lg font-bold text-white">{item[0]}</h2>
          <p class="text-sm leading-6 text-white/55">{item[1]}</p>
        </article>
      {/each}
    </div>
  </section>
</main>
