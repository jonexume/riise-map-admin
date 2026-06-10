import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'https://rollback-may27.dxzx9111fv2of.amplifyapp.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  retries: 0,
  reporter: [['list']],
});
