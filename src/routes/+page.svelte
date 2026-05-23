<!-- src/routes/+page.svelte — SchoolCBT Landing Page -->
<script lang="ts">
  import HeroSection from '$lib/components/HeroSection.svelte';
  import CBTPanel from '$lib/components/CBTPanel.svelte';
  import FeaturesGrid from '$lib/components/FeaturesGrid.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import CBTDemo from '$lib/components/CBTDemo.svelte';
  import PricingSection from '$lib/components/PricingSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import CTABanner from '$lib/components/CTABanner.svelte';
</script>

<svelte:head>
  <title>SchoolCBT – Nigeria's Premier AI CBT Platform | JAMB, WAEC, NECO Results as a Service</title>
  <meta name="description" content="SchoolCBT is Nigeria's #1 AI-powered CBT platform for JAMB, WAEC, NECO & NABTEB. Multi-agent AI, predictive pass analytics, tutor matching. Results as a Service. Join 50,000+ students." />
  <meta name="keywords" content="SchoolCBT, Nigeria CBT exam, JAMB preparation 2025, WAEC practice questions, NECO CBT, AI exam Nigeria, pass JAMB WAEC NECO" />
  <meta property="og:title" content="SchoolCBT – Nigeria's Premier AI CBT Platform" />
  <meta property="og:description" content="Multi-agent AI prepares Nigerian students for JAMB, WAEC & NECO with personalized question batches and guaranteed results." />
</svelte:head>

<HeroSection>
  {#snippet cbtPanel()}
    <CBTPanel />
  {/snippet}
</HeroSection>

<FeaturesGrid />
<HowItWorks />
<CBTDemo />
<PricingSection />
<FAQSection />
<CTABanner />
