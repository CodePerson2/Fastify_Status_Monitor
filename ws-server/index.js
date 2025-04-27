import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import amqp from 'amqplib';

const app = Fastify({ logger: true });
app.register(websocket);

// In-memory status map
let statuses = {};

// Register only the WebSocket route in a plugin so startup isn't blocked
app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    const count = fastify.websocketServer.clients.size;
    fastify.log.info('🟢 Client connected, total=', count);
    socket.send(JSON.stringify({ type: 'welcome', clients: count, ts: Date.now() }));

    // Send the stored snapshot on connect
    socket.send(JSON.stringify({ type: 'initialSnapshot', data: statuses, ts: Date.now() }));

    socket.on('close', () => {
      fastify.log.info('🔴 Client disconnected, total now=', fastify.websocketServer.clients.size);
    });
  });
});

// Helper to reconnect to RabbitMQ with retries
async function connectRabbitWithRetry(url, retries = 10, interval = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await amqp.connect(url);
    } catch (err) {
      app.log.warn(`RabbitMQ not ready (attempt ${i}/${retries}), retrying in ${interval}ms…`);
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  throw new Error('Unable to connect to RabbitMQ after multiple attempts');
}

// Fetch initial snapshot of service statuses from monitor server
async function fetchInitialStatuses() {
  const monitorUrl = process.env.MONITOR_URL || 'http://monitor:3001';
  app.log.info('Fetching initial service statuses from', monitorUrl);
  try {
    const res = await fetch(`${monitorUrl}/statuses`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    statuses = await res.json();
    app.log.info('Initial statuses loaded:', statuses);
  } catch (err) {
    app.log.error('Failed to fetch initial statuses:', err.message);
    return {};
  }
}

async function start() {
  // 1) Start HTTP server so WS route is ready
  await app.listen({ host: '0.0.0.0', port: 4000 });
  app.log.info('🟢 WebSocket server running on port 4000');

  // 2) Fetch and broadcast initial snapshot
  const initialStatuses = await fetchInitialStatuses();
  for (const client of app.websocketServer.clients) {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'initialSnapshot', data: initialStatuses, ts: Date.now() }));
    }
  }

  // 3) Hook up to RabbitMQ without blocking plugin startup
  const rabbitConn = await connectRabbitWithRetry(process.env.RABBITMQ_URL);
  const channel = await rabbitConn.createChannel();
  await channel.assertExchange('services.status', 'fanout');
  const { queue } = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue, 'services.status', '');

  // Consume live deltas
  channel.consume(
    queue,
    (msg) => {
      const payload = JSON.parse(msg.content.toString());
      // Update in-memory statuses
      statuses[payload.service] = payload.up;

      app.log.info('🔄 Broadcasting to', app.websocketServer.clients.size, 'clients');
      for (const client of app.websocketServer.clients) {
        if (client.readyState === 1) client.send(JSON.stringify({ type: 'statusUpdate', data: payload, ts: Date.now() }));
      }
    },
    { noAck: true }
  );
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
