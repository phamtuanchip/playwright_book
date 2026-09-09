import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
  testDir: "./tests",
  snapshotDir: "./__snapshots__",
  timeout: 10 * 1000,
  fullyParallel: true,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
