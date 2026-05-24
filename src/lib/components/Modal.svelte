<script lang="ts">
  let { open = $bindable(false), title = '', subtitle = '', onClose }: {
    open: boolean;
    title?: string;
    subtitle?: string;
    onClose?: () => void;
  } = $props();

  function close() {
    open = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="modal-overlay open"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="glass-deep w-full max-w-md mx-4 rounded-2xl p-8">
      {#if title}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="font-sora text-xl font-bold text-white">{title}</h2>
            {#if subtitle}
              <p class="text-sm text-white/45 mt-0.5">{subtitle}</p>
            {/if}
          </div>
          <button onclick={close} class="glass h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
        </div>
      {/if}
      <slot />
      {#if !title}
        <button onclick={close} class="absolute top-3 right-3 glass h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-white/60 hover:text-white">✕</button>
      {/if}
    </div>
  </div>
{/if}
