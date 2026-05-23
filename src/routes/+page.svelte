<!-- src/routes/+page.svelte — SchoolCBT Landing Page -->
<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import CBTPanel from '$lib/components/CBTPanel.svelte';
  import FeaturesGrid from '$lib/components/FeaturesGrid.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import CBTDemo from '$lib/components/CBTDemo.svelte';
  import PricingSection from '$lib/components/PricingSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import CTABanner from '$lib/components/CTABanner.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import AuthModals from '$lib/components/AuthModals.svelte';
  import Toast from '$lib/components/Toast.svelte';

  let mobileMenuOpen = $state(false);
  let signupOpen = $state(false);
  let loginOpen = $state(false);

  function openSignup() { signupOpen = true; loginOpen = false; }
  function openLogin()  { loginOpen = true; signupOpen = false; }
</script>

<svelte:head>
  <title>SchoolCBT – Nigeria's Premier AI CBT Platform | JAMB, WAEC, NECO Results as a Service</title>
  <meta name="description" content="SchoolCBT is Nigeria's #1 AI-powered CBT platform for JAMB, WAEC, NECO & NABTEB. Multi-agent AI, predictive pass analytics, tutor matching. Results as a Service. Join 50,000+ students." />
  <meta name="keywords" content="SchoolCBT, Nigeria CBT exam, JAMB preparation 2025, WAEC practice questions, NECO CBT, AI exam Nigeria, pass JAMB WAEC NECO" />
  <meta property="og:title" content="SchoolCBT – Nigeria's Premier AI CBT Platform" />
  <meta property="og:description" content="Multi-agent AI prepares Nigerian students for JAMB, WAEC & NECO with personalized question batches and guaranteed results." />
</svelte:head>

<AuthModals bind:signupOpen bind:loginOpen />
<Nav bind:mobileMenuOpen onLogin={openLogin} onSignup={openSignup} />

<HeroSection onSignup={openSignup}>
  {#snippet cbtPanel()}
    <CBTPanel onSignup={openSignup} />
  {/snippet}
</HeroSection>

<FeaturesGrid />
<HowItWorks />
<CBTDemo onSignup={openSignup} />
<PricingSection onSignup={openSignup} />
<FAQSection />
<CTABanner onSignup={openSignup} />
<SiteFooter />
<Toast />
