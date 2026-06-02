<script lang="ts">
  const faqs = [
    {
      q: 'Is SchoolCBT aligned with official Nigerian exams?',
      a: 'Yes. All questions are grounded against the NERDC-approved Nigerian Secondary School Curriculum. Our AI achieves 90%+ grounding accuracy validated by our Quality Evaluator Agent.',
    },
    {
      q: 'How does AI tutor matching work?',
      a: "After each batch, our AI analyzes your performance by topic and Bloom's level. Consistent weaknesses trigger automatic tutor recommendations matched on subject, availability, and rating.",
    },
    {
      q: 'Can I pay in Nigerian Naira?',
      a: 'Absolutely. All pricing is in ₦ Nigerian Naira. We support Paystack for bank transfers, card payments, and USSD. Tutors receive direct bank payouts.',
    },
    {
      q: 'How many subjects can I practice at once?',
      a: 'Each subscription covers one exam type (e.g., WAEC SSCE). Within that exam you can practice all relevant subjects — typically 8-9 core and elective subjects.',
    },
    {
      q: 'Is the platform available on mobile phones?',
      a: 'Yes — SchoolCBT is built mobile-first. Full CBT interface, dashboard, and tutor chat work on any Android or iOS smartphone via browser. No app download required.',
    },
  ]

  let openFaq = $state(-1)
  function toggleFaq(i: number) {
    openFaq = openFaq === i ? -1 : i
  }
</script>

<section class="bg-alt relative py-20">
  <div class="mx-auto max-w-3xl px-4">
    <div class="mb-12 text-center">
      <div class="sec-badge">FAQ</div>
      <h2 class="font-sora mt-3 text-3xl font-bold text-white">
        Frequently Asked <span class="text-gold">Questions</span>
      </h2>
    </div>
    <div class="space-y-3">
      {#each faqs as faq, i}
        <div class="acc-item glass-card overflow-hidden {openFaq === i ? 'open' : ''}">
          <button
            onclick={() => toggleFaq(i)}
            class="w-full flex items-center justify-between p-5 text-left"
          >
            <span class="font-medium text-white text-sm">{faq.q}</span>
            <svg
              class="acc-arrow h-4 w-4 text-gold shrink-0 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div class="acc-body">
            <div class="px-5 pb-5 text-sm text-white/55 leading-relaxed">{faq.a}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
