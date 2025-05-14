// monitor.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkService, statuses, app } from './index.js';


describe('GET /statuses endpoint', () => {
  it('initially returns all services as false', async () => {
    // clear any previous state
    statuses.clear();
    for (const s of ['auth','billing','notifications','analytics']) {
      statuses.set(s, false);
    }

    const res = await app.inject({ method: 'GET', url: '/statuses' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      auth: false,
      billing: false,
      notifications: false,
      analytics: false,
    });
  });
});
