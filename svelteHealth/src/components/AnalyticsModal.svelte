<script>
    import { onDestroy } from 'svelte';
  import { HEALTH_URLS } from '../constants/constants';
    export let open = false;
  
    let activeSessions = 0;
    let pageViews = 0;
    let controller;
  
    $: if (open) {
      fetchData();
    }
  
    async function fetchData() {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch(
          `${HEALTH_URLS.analytics.url}${HEALTH_URLS.analytics.dataEndpoint}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        // Expected shape: { activeSessions, pageViews }
        activeSessions = data.activeSessions;
        pageViews = data.pageViews;
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Analytics fetch error', e);
      }
    }
  
    onDestroy(() => controller?.abort());
  </script>
  
  <div class="content">
    <h2>Analytics Service</h2>
    <p><strong>Active sessions:</strong> {activeSessions}</p>
    <p><strong>Page views today:</strong> {pageViews}</p>
  </div>