<script lang="ts">
  let { message = 'Loading...' }: { message?: string } = $props()
</script>

<div class="flex flex-col items-center justify-center py-20">
  <div class="flex gap-1.5 mb-4">
    {#each [0, 1, 2] as i}
      <div
        class="h-2.5 w-2.5 rounded-full bg-gold animate-bounce"
        style="animation-delay:{i * 0.15}s"
      ></div>
    {/each}
  </div>
  <p class="text-sm text-white/40">{message}</p>
</div>
