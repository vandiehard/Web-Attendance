import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'off' },
  webServer: [
    { command: 'npm run api:start', url: 'http://127.0.0.1:3000/api/v1/health', reuseExistingServer: true, timeout: 30000 },
    { command: 'npm run dev -w apps/web -- --host 127.0.0.1', url: 'http://localhost:5173', reuseExistingServer: true, timeout: 30000 },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], permissions: ['camera', 'geolocation'], geolocation: { latitude: -6.2, longitude: 106.8, accuracy: 25 }, launchOptions: { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } } }],
});
