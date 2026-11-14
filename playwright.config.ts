import { defineConfig, devices } from "@playwright/test";

const SYSTEM_CHROMIUM = "/repl/tools/bin/chromium";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://localhost:5000",
    headless: true,
    serviceWorkers: "block",
    // Simulate a touch-screen phone so .tap() and pointer events work.
    hasTouch: true,
    // Use the NixOS system-provided Chromium so no extra libs are needed.
    launchOptions: {
      executablePath: SYSTEM_CHROMIUM,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
