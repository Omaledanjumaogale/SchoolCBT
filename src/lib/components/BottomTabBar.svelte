<script lang="ts">
  import { page } from '$app/stores';

  const path = $derived($page.url.pathname);

  const tabs = [
    { href: '/',          icon: '🏠', label: 'Home' },
    { href: '/practice',  icon: '⚡', label: 'Practice' },
    { href: '/pricing',   icon: '💰', label: 'Pricing' },
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/about',     icon: '🏢', label: 'About' }
  ];

  function isActive(href: string): boolean {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  }
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/06 flex items-center justify-around py-1 px-1" style="padding-bottom:max(0.25rem, env(safe-area-inset-bottom))">
  {#each tabs as tab}
    <a href={tab.href}
      class="flex flex-col items-center justify-center gap-0.5 min-h-[50px] min-w-[44px] px-1 py-1 rounded-lg transition-colors {isActive(tab.href) ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-white/70'}"
      aria-label={tab.label}
      aria-current={isActive(tab.href) ? 'page' : undefined}
    >
      <span class="text-lg leading-none">{tab.icon}</span>
      <span class="text-[10px] leading-none font-medium">{tab.label}</span>
    </a>
  {/each}
</nav>
