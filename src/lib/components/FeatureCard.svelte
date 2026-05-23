<script lang="ts">
  let { icon, title, desc, prog }: {
    icon: string;
    title: string;
    desc: string;
    prog?: { pct: number; color: string; label: string };
  } = $props();
</script>

<div class="feature-card p-6">
  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-cobalt/40 text-2xl">
    {icon}
  </div>
  <h3 class="mb-2 text-lg font-semibold text-white">{title}</h3>
  <p class="text-sm leading-relaxed text-white/50">{desc}</p>
  {#if prog}
    <div class="mt-4">
      <div class="mb-1.5 flex justify-between text-xs">
        <span class="text-white/45">{prog.label}</span>
        <span class="font-semibold text-{prog.color}">{prog.pct}%</span>
      </div>
      <div class="pbar">
        <div class="pfill bg-{prog.color}" style="width:{prog.pct}%"></div>
      </div>
    </div>
  {/if}
</div>
