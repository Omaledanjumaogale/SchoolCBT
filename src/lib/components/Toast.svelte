<script lang="ts">
  import { uiStore } from '$lib/stores/index';

  let toastId = 0;
  let visible = $state(false);
  let message = $state('');

  uiStore.subscribe(s => {
    if (s.toastMessage && s.toastVisible) {
      message = s.toastMessage;
      visible = true;
    }
    if (!s.toastVisible) {
      setTimeout(() => { visible = false; message = ''; }, 400);
    }
  });
</script>

{#if visible}
  <div
    id="toast"
    style="opacity:1;transform:translateY(0)"
    role="alert"
  >
    <span>{message}</span>
  </div>
{/if}
