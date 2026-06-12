import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "WISHLIST_MODE=mock npm run dev -- --port 4546",
    url: "http://127.0.0.1:4546",
    env: {
      WISHLIST_MODE: "mock",
      OWNER_PASSCODE: "12345",
      STUDIO_COOKIE_SECRET: "12345"
    },
    reuseExistingServer: false
  },
  use: {
    baseURL: "http://127.0.0.1:4546",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } }
  ]
});
