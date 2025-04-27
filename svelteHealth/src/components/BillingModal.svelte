<script>
    import { onDestroy } from 'svelte';
    import { HEALTH_URLS } from '../constants/constants';
    export let open = false;
  
    let totalInvoices = 0;
    let revenue = '';
    let controller;
  
    $: if (open) {
      fetchData();
    }
  
    async function fetchData() {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch(
          `${HEALTH_URLS.billing.url}${HEALTH_URLS.billing.dataEndpoint}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        // Expected shape: { totalInvoices, revenue }
        totalInvoices = data.totalInvoices;
        revenue = data.revenue;
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Billing fetch error', e);
      }
    }
  
    onDestroy(() => controller?.abort());
  </script>
  
  <div class="content">
    <h2>Billing Service</h2>
    <p><strong>Invoices generated:</strong> {totalInvoices}</p>
    <p><strong>Revenue:</strong> {revenue}</p>
  </div>