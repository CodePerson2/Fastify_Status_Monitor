<script>
  import { onDestroy } from 'svelte';
  import { HEALTH_URLS } from '../constants/constants';
  export let open = false;

  let pending = 0;
  let lastSent = '';
  let controller;

  $: if (open) {
    fetchData();
  }

  async function fetchData() {
    controller?.abort();
    controller = new AbortController();
    try {
      const res = await fetch(
        `${HEALTH_URLS.notifications.url}${HEALTH_URLS.notifications.dataEndpoint}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      // Expected shape: { pending, lastSent }
      pending = data.pending;
      lastSent = data.lastSent;
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Notifications fetch error', e);
    }
  }

  onDestroy(() => controller?.abort());
</script>

<div class="content">
  <h2>Notifications Service</h2>
  <p><strong>Pending notifications:</strong> {pending}</p>
  <p><strong>Last sent:</strong> {lastSent}</p>
</div>