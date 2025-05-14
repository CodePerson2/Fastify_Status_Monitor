import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import amqp from 'amqplib';

describe('RabbitMQ Integration', () => {
  let connection;
  let channel;

  // Wait for RabbitMQ to be ready before connecting
  beforeAll(async () => {
    const maxRetries = 20;
    const delay = 500; // ms
    let lastErr;
    for (let i = 0; i < maxRetries; i++) {
      try {
        connection = await amqp.connect('amqp://test:test@localhost:5672');
        channel = await connection.createChannel();
        return;
      } catch (err) {
        lastErr = err;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error('Could not connect to RabbitMQ after waiting: ' + lastErr);
  });

  afterAll(async () => {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  });

  it('should publish and consume a message', async () => {
    const queue = 'test-queue';
    const msg = 'hello world';

    await channel.assertQueue(queue, { durable: false });
    await channel.sendToQueue(queue, Buffer.from(msg));

    const received = await new Promise((resolve) => {
      channel.consume(queue, (msg) => {
        resolve(msg.content.toString());
      }, { noAck: true });
    });

    expect(received).toBe(msg);
  });
});
