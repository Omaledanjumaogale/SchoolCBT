<script lang="ts">
  let { message = 'No data available', icon = '📭' }: { message?: string; icon?: string } = $props();
</script>

<div class="text-center py-16 text-white/35">
  <div class="text-4xl mb-3">{icon}</div>
  <p class="text-sm">{message}</p>
  <slot />
</div>
