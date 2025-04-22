<script>
  import { onMount } from 'svelte';
  import { store } from './store/serviceStatus';
  import { startStatusMonitor } from './lib/statusMonitor';

  let authUp = false;
  let billingUp = false;

  onMount(() => {
    console.log('Starting status monitor...');
    startStatusMonitor();

    // subscribe returns an unsubscribe function
    const unsubscribe = store.subscribe(() => {
      // 🔑 pull the up‑to‑date state here:
      const state = store.getState();
      authUp    = state.auth;
      billingUp = state.billing;
    });

    // initialize values right away
    const init = store.getState();
    authUp    = init.auth;
    billingUp = init.billing;

    // cleanup on destroy
    return () => unsubscribe();
  });
</script>

{#if authUp}
  <div>Hi auth working!</div>
{:else}
  <div class="alert">Authentication is currently unavailable.</div>
{/if}

{#if billingUp}
  <div>Hi billing working!</div>
{:else}
  <div class="alert">Billing is currently offline.</div>
{/if}
