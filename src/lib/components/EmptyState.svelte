<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    message = 'No data available',
    icon = '📭',
    children,
  }: { message?: string; icon?: string; children?: Snippet } = $props()
</script>

<div class="text-center py-16 text-white/35">
  <div class="text-4xl mb-3">{icon}</div>
  <p class="text-sm">{message}</p>
  {@render children?.()}
</div>
