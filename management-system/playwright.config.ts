import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the Firebase emulators:
 *   npm run test:e2e
 * which starts the emulators, seeds demo data, builds and serves the app on port 3100.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const emulatorEnv = {
  FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099",
  FIREBASE_STORAGE_EMULATOR_HOST: process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199",
  FIREBASE_PROJECT_ID: "demo-primeresearch",
  SESSION_SECRET: "e2e-session-secret-that-is-long-enough-123456",
  SETUP_KEY: "e2e-setup-key-123",
  CLIENT_IP_SOURCE: "x-forwarded-for:1",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.E2E_DEV ? `npx next dev -p ${PORT}` : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: emulatorEnv,
  },
});
