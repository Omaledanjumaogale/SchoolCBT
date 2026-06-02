<script lang="ts">
  import PricingCard from './PricingCard.svelte'
</script>

<section id="pricing" class="relative py-24 overflow-hidden">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div class="mb-16 text-center">
      <div class="sec-badge">Transparent Pricing</div>
      <h2 class="font-sora mt-3 mb-4 text-4xl font-bold text-white">
        Simple, Results-Focused <span class="text-gold">Plans</span>
      </h2>
      <p class="mx-auto max-w-xl text-white/50">
        One flat subscription in Nigerian Naira. No hidden fees. Full AI-powered prep until your
        exam date.
      </p>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <PricingCard
        planId="student-single"
        label="Student — Single Exam"
        price="₦10,000"
        sub="per exam type"
        priceColor="text-white"
        badge="badge-blue"
        ctaText="Get Started"
        features={[
          'Unlimited AI question batches',
          'AI-generated study plan',
          'Automated report cards',
          'Predictive pass analytics',
        ]}
      />
      <PricingCard
        planId="student-premium"
        label="Student + Tutor Support"
        price="₦25,000"
        sub="per exam + tutor"
        priceColor="text-gold"
        popular={true}
        badge="badge-gold"
        ctaText="Get Started →"
        features={[
          'Unlimited AI question batches',
          'AI-generated study plan',
          'Automated report cards',
          'Predictive pass analytics',
          'AI tutor matching system',
        ]}
      />
      <PricingCard
        planId="school"
        label="School / Institution"
        price="Custom"
        sub="volume pricing"
        priceColor="text-jade"
        badge="badge-jade"
        ctaText="Contact Sales"
        features={[
          'Bulk onboarding',
          'Admin dashboard',
          'Custom branding',
          'API integration',
          'Priority support',
        ]}
      />
    </div>
  </div>
</section>
