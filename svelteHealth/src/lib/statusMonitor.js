// src/lib/statusMonitor.js
import { HEALTH_ENDPOINT, HEALTH_URLS, MSG_TYPES, WS_URL } from '../constants/constants';
import { store, updateStatus } from '../store/serviceStatus';

let ws, reconnectTimer;

function connect() {
  ws = new WebSocket(WS_URL);
  console.log('Connecting to WS server:', WS_URL);

  ws.onopen = () => {
    console.log('✅ WS open! readyState=', ws.readyState);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = evt => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return console.error('Invalid WS payload:', evt.data);
    }
    console.log('📦 WS message:', msg);
    if(msg.type === MSG_TYPES.INITIAL_SNAPSHOT) {
      // Initial snapshot of all services
      for (const [service, up] of Object.entries(msg.data)) {
        store.dispatch(updateStatus({ service, up }));
      }
    } else if(msg.type === MSG_TYPES.STATUS_UPDATE) {
      // Update for a single service
      const { service, up } = msg.data;
      store.dispatch(updateStatus({ service, up }));
      return;
    }
  };

  ws.onerror = e => console.error('❌ WS error', e);

  ws.onclose = e => {
    console.warn('🔒 WS closed:', e.code, e.reason);
    // fallback: poll every 10s
    pollHealth();
    // try reconnecting in 5s
    reconnectTimer = setTimeout(connect, 5000);
  };
}

async function pollHealth() {
  for (const svc of Object.keys(HEALTH_URLS)) {
    try {
      const res = await fetch(HEALTH_URLS[svc].url + HEALTH_ENDPOINT);
      console.log('Polling', svc, 'status:', res.ok);
      store.dispatch(updateStatus({ service: svc, up: res.ok }));
    } catch {
      store.dispatch(updateStatus({ service: svc, up: false }));
    }
  }
}

export function startStatusMonitor() {
  connect();
}
