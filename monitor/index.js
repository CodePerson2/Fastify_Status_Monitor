import Fastify from 'fastify';
import amqp from 'amqplib';
import AbortController from 'abort-controller';

const SERVICES = [
  { name: 'auth', url: 'http://service-a:3001/health' },
  { name: 'billing', url: 'http://service-b:3002/health' },
];

// Map to hold the latest status of each service
const statuses = new Map(SERVICES.map(s => [s.name, false]));

// Fastify server for snapshot endpoint
const app = Fastify({ logger: true });
app.get('/statuses', async (request, reply) => {
  // Return the latest snapshot of service statuses
  return Object.fromEntries(statuses);
});

// Helper that checks a single service
async function checkService({ name, url }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return { name, up: res.status === 200 };
  } catch {
    // any fetch error or timeout => down
    return { name, up: false };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Connect to RabbitMQ with retry logic
async function startMonitor() {
  // Start HTTP server first so snapshot is always available
  const port = process.env.MONITOR_PORT || 3001;
  await app.listen({ host: '0.0.0.0', port });
  app.log.info(`📡 Monitor HTTP endpoint running on port ${port}`);

  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange('services.status', 'fanout');

  // Periodic health checks and publishing only on change
  setInterval(() => {
    Promise.all(SERVICES.map(checkService))
      .then(results => {
        for (const { name, up } of results) {
          const prev = statuses.get(name);
          if (up !== prev) {
            statuses.set(name, up);
            try {
              app.log.info(`Publishing change: ${name} -> ${up}`);
              channel.publish(
                'services.status',
                '',
                Buffer.from(JSON.stringify({ service: name, up, ts: Date.now() })),
                { persistent: true }
              );
            } catch (pubErr) {
              app.log.error(`Failed publish for ${name}:`, pubErr);
            }
          }
        }
      })
      .catch(err => app.log.error('Health-check error:', err));
  }, 2000);

  app.log.info('🔄 Service monitor running with change detection');
}

startMonitor().catch(err => {
  console.error('Monitor startup failed:', err);
  process.exit(1);
});
