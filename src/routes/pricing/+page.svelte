<script lang="ts">
  import PricingSection from '$lib/components/PricingSection.svelte'
  import { ogMeta, jsonLDBreadcrumb } from '$lib/seo'
</script>

<svelte:head>
  <title>Pricing — SchoolCBT | Simple, Results-Focused Plans</title>
  <meta
    name="description"
    content="SchoolCBT pricing in Nigerian Naira. Student plans from ₦10,000 per exam. Institution and school bulk pricing available. No hidden fees."
  />
  <meta
    name="keywords"
    content="SchoolCBT pricing, CBT exam cost Nigeria, JAMB preparation price, WAEC practice subscription, student plan Nigeria"
  />
  {@html ogMeta({
    title: 'Pricing — SchoolCBT | Simple, Results-Focused Plans',
    description:
      'SchoolCBT pricing in Nigerian Naira. Student plans from ₦10,000 per exam. Institution and school bulk pricing available. No hidden fees.',
    path: '/pricing',
  })}
  {@html `<script type="application/ld+json">${jsonLDBreadcrumb([
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
  ])}<\/script>`}
</svelte:head>

<div class="min-h-screen bg-[#04091a] pt-16">
  <PricingSection />
</div>
