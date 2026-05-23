<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // SEO meta defaults
  const defaultTitle = 'SchoolCBT – Nigeria\'s Premier AI-Powered CBT Platform';
  const defaultDesc  = 'Nigeria\'s #1 AI CBT platform for JAMB, WAEC, NECO & NABTEB. Multi-agent AI generates personalized question batches, predictive pass analytics, tutor matching and automated report cards. Results as a Service.';

  let { children } = $props();

  onMount(() => {
    if (!browser) return;
    // Smooth scroll polyfill for Safari
    document.documentElement.style.scrollBehavior = 'smooth';
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#04091a" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="SchoolCBT Technologies Ltd." />
  <meta name="geo.region" content="NG" />
  <meta name="geo.placename" content="Lagos, Nigeria" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="SchoolCBT" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_NG" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@SchoolCBT" />

  <!-- Structured Data — Organization -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolCBT",
    "url": "https://schoolcbt.com.ng",
    "logo": "https://schoolcbt.com.ng/logo.png",
    "description": "${defaultDesc}",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressCountry": "NG"
    },
    "sameAs": [
      "https://twitter.com/SchoolCBT",
      "https://linkedin.com/company/schoolcbt"
    ]
  }
  <\/script>`}

  <!-- Preconnect fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
    rel="stylesheet"
  />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

{@render children()}
