<script lang="ts">
  import { uiStore } from '$lib/stores/index'

  let visible = $state(false)
  let message = $state('')

  uiStore.subscribe(s => {
    if (s.toastMessage && s.toastVisible) {
      message = s.toastMessage
      visible = true
    }
    if (!s.toastVisible) {
      setTimeout(() => {
        visible = false
        message = ''
      }, 400)
    }
  })
</script>

{#if visible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="glass fixed z-[9999] bottom-6 right-6 max-w-[340px] rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-sm transition-all duration-300 animate-fade-up"
    role="alert"
  >
    <span>{message}</span>
  </div>
{/if}
