import { defineConfig, devices } from "@playwright/test";

// Chương 9: thêm "baseURL" (test không cần gõ URL đầy đủ, chỉ "/login") và "webServer"
// (Playwright tự khởi chạy demo app trước khi chạy test, tự tắt sau khi xong — không cần
// mở tay một terminal riêng để `npm start` trong code/demo-app/).
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm start",
    cwd: "../demo-app",
    url: "http://localhost:3000/healthz",
    reuseExistingServer: !process.env.CI,
  },
});
