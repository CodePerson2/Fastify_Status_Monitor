import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify();
app.register(cors, { origin: 'http://localhost:5173' });

app.get('/health', async () => ({ status: 'ok' }));

app.get('/billing', async (request, reply) => {
    // Example payload shape
    return {
      totalInvoices: 256,
      revenue: "$12,345.67",
    };
  });

app.listen({ port: 3002, host: '0.0.0.0' });