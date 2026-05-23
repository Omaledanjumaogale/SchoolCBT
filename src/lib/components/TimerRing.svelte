<script lang="ts">
  let { seconds = 50, total = 50, size = 38, strokeWidth = 2.5, class: klass = '' }: {
    seconds: number;
    total?: number;
    size?: number;
    strokeWidth?: number;
    class?: string;
  } = $props();

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = $derived(circumference - (circumference * seconds / total));
  const color = $derived(seconds <= 10 ? '#DC3545' : seconds <= 20 ? '#FF8800' : '#FFD700');
</script>

<div class="timer-ring {seconds <= 10 ? 'timer-urgent' : ''} {klass}">
  <svg width={size} height={size} viewBox="0 0 {size} {size}">
    <circle cx={center} cy={center} r={radius}
      stroke="rgba(255,255,255,0.08)" stroke-width={strokeWidth} fill="none" />
    <circle cx={center} cy={center} r={radius}
      stroke={color} stroke-width={strokeWidth} fill="none"
      stroke-linecap="round" stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      style="transition: stroke-dashoffset 1s linear, stroke 0.3s" />
  </svg>
  <span class="absolute font-mono font-bold text-white" style="font-size:{size * 0.017}rem">{seconds}</span>
</div>
