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
    // A fixed IPv4 address, so the counter tests can point the name openchiari.org at the same server.
    baseURL: 'http://127.0.0.1:4322',
    // WebGL in headless Chromium runs on its software renderer (SwiftShader).
    launchOptions: { executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'npx astro preview --port 4322 --host 127.0.0.1 --ignore-lock',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
  },
});
