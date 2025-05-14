// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',    // use Node.js globals
    globals: true,          // so you can use describe/it/expect without import
  },
});
