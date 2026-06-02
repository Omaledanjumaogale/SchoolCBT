<script lang="ts">
  let {
    value,
    label,
    color = 'text-white',
    badge,
  }: {
    value: string
    label: string
    color?: string
    badge?: string
  } = $props()
</script>

<div class="stat-card p-5 text-center">
  <div class="font-sora text-3xl font-extrabold {color}">{value}</div>
  <div class="mt-1 font-mono text-xs text-white/35 uppercase tracking-widest">{label}</div>
  {#if badge}
    <div class="badge badge-blue mt-2">{badge}</div>
  {/if}
</div>
