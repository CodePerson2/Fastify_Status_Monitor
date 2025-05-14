// unit.test.js
import { describe, it, expect } from 'vitest';
import { checkService } from './index.js';

describe('checkService', () => {
  it('returns up=true for status 200', async () => {
    global.fetch = async () => ({ status: 200 });
    const result = await checkService({ name: 'unit', url: 'http://x' });
    expect(result).toEqual({ name: 'unit', up: true });
  });
});
