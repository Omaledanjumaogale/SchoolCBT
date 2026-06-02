<script lang="ts">
  import type { Snippet } from 'svelte'

  let { fallback, children }: { fallback?: string; children?: Snippet } = $props()
  let error = $state<string | null>(null)
  let errorStack = $state<string | null>(null)

  function reset() {
    error = null
    errorStack = null
  }
</script>

{#if error}
  <div class="glass-card p-8 m-4 text-center">
    <div class="text-4xl mb-3">⚠️</div>
    <h2 class="font-sora text-xl font-bold text-white mb-2">Something went wrong</h2>
    <p class="text-sm text-white/55 mb-4">{error}</p>
    <button onclick={reset} class="btn-gold px-6 py-2.5 text-sm">Try Again</button>
    {#if errorStack}
      <details class="mt-4 text-left">
        <summary class="text-xs text-white/30 cursor-pointer hover:text-white/50"
          >Error details</summary
        >
        <pre
          class="mt-2 text-xs text-white/30 bg-cobalt-xdark/60 p-3 rounded-xl overflow-x-auto">{errorStack}</pre>
      </details>
    {/if}
  </div>
{:else if fallback}
  <div class="p-8 text-center text-white/40">{fallback}</div>
{:else}
  {@render children?.()}
{/if}
