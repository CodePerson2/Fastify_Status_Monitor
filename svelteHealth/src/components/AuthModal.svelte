<script>
    import { onDestroy } from 'svelte';
    import { HEALTH_URLS } from '../constants/constants';
    export let open = false;
  
    let userCount = 0;
    let lastSync = '';
    let controller;
  
    // Fetch whenever modal opens
    $: if (open) {
      fetchData();
    }
  
    async function fetchData() {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch(
          `${HEALTH_URLS.auth.url}${HEALTH_URLS.auth.dataEndpoint}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        // Expected shape: { userCount, lastSync }
        userCount = data.userCount;
        lastSync = data.lastSync;
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Auth fetch error', e);
      }
    }
  
    onDestroy(() => controller?.abort());
  </script>
  
  <div class="content">
    <h2>Authentication Service</h2>
    <p><strong>Active users:</strong> {userCount}</p>
    <p><strong>Last sync:</strong> {lastSync}</p>
  </div>