// monitor.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkService, statuses, app } from './index.js';

describe('checkService()', () => {
  beforeEach(() => {
    // reset any timers or mocks
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns up=true when fetch resolves with status 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200 });
    const result = await checkService({ name: 'auth', url: 'http://x' });
    expect(result).toEqual({ name: 'auth', up: true });
  });

  it('returns up=false when fetch resolves with non-200 status', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 500 });
    const result = await checkService({ name: 'billing', url: 'http://x' });
    expect(result).toEqual({ name: 'billing', up: false });
  });

  it('returns up=false when fetch rejects (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    const result = await checkService({ name: 'notify', url: 'http://x' });
    expect(result).toEqual({ name: 'notify', up: false });
  });
});

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
