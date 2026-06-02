<script lang="ts">
  import { showModal } from '$lib/stores'
  let {
    planId,
    label,
    price,
    sub,
    priceColor = 'text-white',
    popular = false,
    badge = 'badge-blue',
    features = [],
    ctaText = 'Get Started',
  }: {
    planId: string
    label: string
    price: string
    sub: string
    priceColor?: string
    popular?: boolean
    badge?: string
    features: string[]
    ctaText: string
  } = $props()
</script>

<div class="pricing-card {popular ? 'popular' : ''} relative flex flex-col p-7">
  {#if popular}
    <div
      class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold to-gold/80 px-5 py-1.5 text-xs font-extrabold text-cobalt whitespace-nowrap"
    >
      ⭐ Most Popular
    </div>
  {/if}
  <span class="badge {badge} mb-4 self-start">{label}</span>
  <div class="font-sora mb-1 text-4xl font-extrabold {priceColor}">{price}</div>
  <div class="mb-6 text-sm text-white/35">{sub}</div>
  <div class="mb-8 flex-1 space-y-3 text-sm text-white/65">
    {#each features as f}
      <div class="flex items-center gap-2">
        <span class="text-jade font-bold">✓</span>{f}
      </div>
    {/each}
  </div>
  <button
    onclick={() => showModal('signup')}
    class="btn-{popular ? 'gold' : planId === 'school' ? 'primary' : 'outline'} w-full py-3 text-sm"
  >
    {ctaText}
  </button>
</div>
