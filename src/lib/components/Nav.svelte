<script lang="ts">
  import { page } from '$app/stores';
  import { authStore, isAuthenticated, showModal } from '$lib/stores';
  import { logoutUser } from '$lib/firebase';

  let { mobileMenuOpen = $bindable(false) }: { mobileMenuOpen?: boolean } = $props();

  const isHome = $derived($page.url.pathname === '/');
  const loggedIn = $derived($isAuthenticated);
  const user = $derived($authStore);

  function href(section: string, route: string) {
    return isHome ? section : route;
  }

  const navLinks = [
    { section: '#features', route: '/#features', label: 'Features' },
    { section: '#cbt-demo', route: '/#cbt-demo', label: 'Live Demo' },
    { section: '#curriculum', route: '/curriculum', label: 'Curriculum' },
    { section: '#pricing', route: '/pricing', label: 'Pricing' },
    { section: '#about', route: '/about', label: 'About' }
  ];

  const mobileLinks = [
    { section: '#features', route: '/#features', label: '🎯 Features' },
    { section: '#cbt-demo', route: '/#cbt-demo', label: '⚡ Live Demo' },
    { section: '#curriculum', route: '/curriculum', label: '📚 Curriculum' },
    { section: '#pricing', route: '/pricing', label: '💰 Pricing' },
    { section: '#about', route: '/about', label: '🏢 About' }
  ];

  function closeMenu() { mobileMenuOpen = false; }

  async function handleLogout() {
    closeMenu();
    await logoutUser();
    authStore.logout();
    window.location.href = '/';
  }
</script>

<nav class="glass-nav fixed top-0 right-0 left-0 z-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-cobalt-light to-cobalt glow-gold">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFD700" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="font-sora text-xl font-extrabold">
          <span class="text-white">School</span><span class="text-gold">CBT</span>
        </span>
      </a>

      <div class="hidden items-center gap-6 lg:flex">
        {#each navLinks as link}
          <a href={href(link.section, link.route)} class="nav-link">{link.label}</a>
        {/each}
      </div>

      <div class="flex items-center gap-3">
        {#if loggedIn && $user}
          <a href="/dashboard" class="hidden sm:inline-flex items-center gap-2 btn-ghost px-3 py-2 text-sm">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
              {($user.displayName ?? 'U').charAt(0).toUpperCase()}
            </span>
            <span class="text-white/60">{$user.displayName ?? 'Dashboard'}</span>
          </a>
          <button onclick={handleLogout} class="btn-ghost hidden px-4 py-2 text-sm sm:inline-flex">Log Out</button>
        {:else}
          <button onclick={() => showModal('login')} class="btn-ghost hidden px-4 py-2 text-sm sm:inline-flex">Log In</button>
          <button onclick={() => showModal('signup')} class="btn-gold hidden px-5 py-2 text-sm sm:inline-flex">Get Started →</button>
        {/if}
        <button onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="glass ml-1 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl lg:hidden"
          aria-label="Menu">
          {#if mobileMenuOpen}
            <span class="block h-0.5 w-5 bg-white/70 rotate-45 translate-y-2 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 opacity-0 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 -rotate-45 -translate-y-2 transition-all"></span>
          {:else}
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
            <span class="block h-0.5 w-5 bg-white/70 transition-all"></span>
          {/if}
        </button>
      </div>
    </div>

    <div class="mobile-menu {mobileMenuOpen ? 'open' : ''}">
      <div class="border-t border-white/06 py-4 space-y-1">
        {#each mobileLinks as link}
          <a href={href(link.section, link.route)} onclick={closeMenu}
            class="block rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
            {link.label}
          </a>
        {/each}
        <div class="flex gap-3 px-4 pt-3 pb-2 border-t border-white/06 mt-2">
          {#if loggedIn}
            <a href="/dashboard" onclick={closeMenu} class="flex-1 btn-ghost py-2.5 text-sm border border-white/10 rounded-xl text-center">Dashboard</a>
            <button onclick={handleLogout} class="flex-1 btn-gold py-2.5 text-sm">Log Out</button>
          {:else}
            <button onclick={() => { showModal('login'); closeMenu(); }} class="flex-1 btn-ghost py-2.5 text-sm border border-white/10 rounded-xl">Log In</button>
            <button onclick={() => { showModal('signup'); closeMenu(); }} class="flex-1 btn-gold py-2.5 text-sm">Get Started</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>
