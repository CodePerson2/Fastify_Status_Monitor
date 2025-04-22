// service-a/index.js
import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();

// allow dev frontend origin (or use '*' in dev):
app.register(cors, { origin: 'http://localhost:5173' });

app.get('/health', async (req, reply) => {
  return { status: 'ok' };
});

// …other routes…

app.listen({ port: 3001, host: '0.0.0.0' });