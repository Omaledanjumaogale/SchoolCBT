<script lang="ts">
  let { variant = 'blue', class: klass = '' }: { variant?: string; class?: string } = $props();
</script>

<span class="badge badge-{variant} {klass}"><slot /></span>
