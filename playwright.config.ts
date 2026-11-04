import { defineConfig } from '@playwright/test';

// Automated checks run against the built site (npm run build first).
// In CI the browser comes from `npx playwright install`. In cloud sessions with a
// preinstalled Chromium, PLAYWRIGHT_CHROMIUM_PATH can point at it.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4322',
    launchOptions: { executablePath },
  },
  webServer: {
    command: 'npx astro preview --port 4322 --ignore-lock',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
  },
});
