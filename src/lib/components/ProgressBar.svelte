<script lang="ts">
  let {
    pct,
    color = 'jade',
    label = '',
    class: klass = '',
  }: {
    pct: number
    color?: string
    label?: string
    class?: string
  } = $props()
</script>

{#if label}
  <div class="mb-1.5 flex justify-between text-xs">
    <span class="text-white/45">{label}</span>
    <span class="font-semibold text-{color}">{pct}%</span>
  </div>
{/if}
<div class="pbar {klass}">
  <div class="pfill bg-{color}" style="width:{pct}%"></div>
</div>
