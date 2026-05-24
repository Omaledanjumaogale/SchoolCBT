<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import AuthModals from '$lib/components/AuthModals.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import BottomTabBar from '$lib/components/BottomTabBar.svelte';
  import { uiStore, showModal, hideModals, authStore, isAuthenticated } from '$lib/stores';
  import { onAuthChange, sendVerificationEmail } from '$lib/firebase';
  import { onMount } from 'svelte';

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  let signupOpen = $state(false);
  let loginOpen = $state(false);
  let emailNotVerified = $state(false);
  let resendingVerification = $state(false);

  uiStore.subscribe(s => {
    signupOpen = s.signupModal;
    loginOpen = s.loginModal;
  });

  onMount(() => {
    const unsub = onAuthChange(firebaseUser => {
      if (firebaseUser) {
        emailNotVerified = !firebaseUser.emailVerified;
        authStore.login({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'User',
          role: 'student',
          photoURL: firebaseUser.photoURL ?? undefined
        });
      } else {
        emailNotVerified = false;
        authStore.logout();
      }
    });
    return unsub;
  });

  async function resendVerification() {
    resendingVerification = true;
    try {
      await sendVerificationEmail();
    } catch { /* silently fail */ }
    resendingVerification = false;
  }
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#04091a" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="SchoolCBT Technologies Ltd." />
  <meta name="geo.region" content="NG" />
  <meta name="geo.placename" content="Lagos, Nigeria" />
  <meta property="og:site_name" content="SchoolCBT" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_NG" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@SchoolCBT" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SchoolCBT",
    "url": "https://schoolcbt.ewinproject.org",
    "description": "Nigeria's #1 AI CBT platform for JAMB, WAEC, NECO & NABTEB.",
    "address": { "@type": "PostalAddress", "addressLocality": "Lagos", "addressCountry": "NG" }
  }
  <\/script>`}
</svelte:head>

<AuthModals bind:signupOpen bind:loginOpen />
<Nav bind:mobileMenuOpen />

{#if emailNotVerified}
  <div class="relative z-40 pt-16">
    <div class="bg-gold/10 border-b border-gold/20 py-2.5 px-4 text-center">
      <p class="text-xs text-gold">
        ⚠️ Your email is not verified. Check your inbox or
        <button onclick={resendVerification} class="underline hover:text-white transition-colors">
          {resendingVerification ? 'Sending...' : 'resend verification email'}
        </button>
      </p>
    </div>
  </div>
{/if}

{@render children()}

<SiteFooter />
<BottomTabBar />
<Toast />
