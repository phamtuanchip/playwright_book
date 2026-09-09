import { defineConfig, devices } from "@playwright/test";

// Cấu hình tối thiểu (Chương 8) — chỉ đủ để chạy một test đầu tiên, chưa có
// baseURL/webServer vì demo app chưa tồn tại. Chương 9 sẽ thêm "webServer" để
// tự động khởi chạy demo app, và "baseURL" để các test không cần gõ URL đầy đủ.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
