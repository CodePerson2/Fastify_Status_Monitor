// service-a/index.js
import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();

// allow dev frontend origin (or use '*' in dev):
app.register(cors, { origin: 'http://localhost:5173' });

app.get('/health', async (req, reply) => {
  return { status: 'ok' };
});

app.get('/analytics', async (request, reply) => {
  // Example payload shape
  return {
    activeSessions: 87,
    pageViews: 1024,
  };
});

app.listen({ port: 3004, host: '0.0.0.0' });