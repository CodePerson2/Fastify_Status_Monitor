<script>
  import { onMount } from 'svelte';
  import { store } from './store/serviceStatus';
  import { startStatusMonitor } from './lib/statusMonitor';
  import Status from './components/Status.svelte';
  import Modal from './components/Modal.svelte';
  import AuthModal from './components/AuthModal.svelte';
  import BillingModal from './components/BillingModal.svelte';
  import AnalyticsModal from './components/AnalyticsModal.svelte';
  import NotificationsModal from './components/NotificationsModal.svelte';

  let authUp = false;
  let billingUp = false;
  let analyticsUp = false;
  let notificationsUp = false;
  let activeModal = null;

  onMount(() => {
    console.log('Starting status monitor...');
    startStatusMonitor();

    // subscribe returns an unsubscribe function
    const unsubscribe = store.subscribe(() => {
      // 🔑 pull the up‑to‑date state here:
      const state = store.getState();
      authUp    = state.auth;
      billingUp = state.billing;
      analyticsUp = state.analytics;
      notificationsUp = state.notifications;
    });

    // initialize values right away
    const init = store.getState();
    authUp    = init.auth;
    billingUp = init.billing;
    analyticsUp = init.analytics;
    notificationsUp = init.notifications;

    // cleanup on destroy
    return () => unsubscribe();
  });

  const openModal = name => activeModal = name;
  const closeModal = () => activeModal = null;
</script>

<style>
  .container {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    padding: 1rem;
  }
  header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
  .status-list {
    display: flex;
    gap: 1rem;
  }
  main {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 600px;
  }
  button {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #374151; /* blue-600 */
    color: white;
    transition: background 0.2s;
  }
  button:hover:not(:disabled) {
    background: #1f2937;
  }
</style>

<div class="container">
  <header>
    <h1>Websocket Live Microservice Monitor</h1>
    <div class="status-list">
      <Status name="Authentication Service" running={authUp} />
      <Status name="Billing Service" running={billingUp} />
      <Status name="Analytics Service" running={analyticsUp} />
      <Status name="Notifications Service" running={notificationsUp} />
    </div>
  </header>

  <main>
    <div class="buttons">
      {#if authUp}
        <button on:click={() => openModal('auth')}>
          Open Authentication Service
        </button>
      {/if}
      {#if billingUp}
        <button on:click={() => openModal('billing')}>
          Open Billing Service
        </button>
      {/if}
      {#if analyticsUp}
        <button on:click={() => openModal('analytics')}>
          Open Analytics Service
        </button>
      {/if}
      {#if notificationsUp}
        <button on:click={() => openModal('notifications')}>
          Open Notifications Service
        </button>
      {/if}
    </div>
  </main>

  <!-- Modals -->
  <Modal open={activeModal === 'auth'} on:close={closeModal}>
    <AuthModal open={activeModal === 'auth'} />
  </Modal>
  <Modal open={activeModal === 'billing'} on:close={closeModal}>
    <BillingModal open={activeModal === 'billing'} />
  </Modal>
  <Modal open={activeModal === 'analytics'} on:close={closeModal}>
    <AnalyticsModal open={activeModal === 'analytics'} />
  </Modal>
  <Modal open={activeModal === 'notifications'} on:close={closeModal}>
    <NotificationsModal open={activeModal === 'notifications'} />
  </Modal>
</div>