<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant = 'blue',
    class: klass = '',
    children,
  }: { variant?: string; class?: string; children?: Snippet } = $props()
</script>

<span class="badge badge-{variant} {klass}">{@render children?.()}</span>
