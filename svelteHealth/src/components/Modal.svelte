<script>
    import { createEventDispatcher } from 'svelte';
    export let open = false;
    const dispatch = createEventDispatcher();
    function close() {
      dispatch('close');
    }
  </script>
  
  {#if open}
    <div class="modal-overlay" on:click={close}>
      <div class="modal" on:click|stopPropagation>
        <button class="close-btn" on:click={close}>✕</button>
        <slot />
      </div>
    </div>
  {/if}
  
  <style>
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }
    .modal {
      position: relative;
      background: #fff;
      border-radius: 0.5rem;
      padding: 1.5rem;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .close-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
    }
  </style>