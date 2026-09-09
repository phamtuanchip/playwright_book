import { defineConfig, devices } from "@playwright/test";

// Chương 9: thêm "baseURL" (test không cần gõ URL đầy đủ, chỉ "/login") và "webServer"
// (Playwright tự khởi chạy demo app trước khi chạy test, tự tắt sau khi xong — không cần
// mở tay một terminal riêng để `npm start` trong code/demo-app/).
export default defineConfig({
  testDir: "./tests",
  // Chương 11: tạm đặt fullyParallel=false + workers=1 — demo app dùng CHUNG một tài khoản
  // (demo@example.com) trên MỘT server duy nhất, nên các test đổi trạng thái tài khoản đó
  // (đăng nhập sai, khoá, reset...) sẽ đụng độ nếu chạy song song. Chương 23 quay lại vấn đề
  // này đúng cách (mỗi worker seed dữ liệu riêng) để bật lại chạy song song an toàn.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Chương 18: chạy CÙNG LÚC 2 reporter — "html" (đã dùng từ đầu) và "allure-playwright"
  // (ghi kết quả thô vào allure-results/, xem Chương 18 để biết cách sinh báo cáo HTML từ đó).
  // Chương 26: thêm reporter tuỳ biến "./tools/simple-reporter.js" — chỉ cần đường dẫn tới
  // file export một class có onBegin/onTestEnd/onEnd, không cần cài package nào.
  reporter: [["html"], ["allure-playwright"], ["./tools/simple-reporter.js"]],

  // Chương 22: chạy 1 lần trước MỌI test (không phải mỗi file) — đăng nhập qua API, lưu
  // cookie session vào storageState.json để các test dùng `test.use({ storageState: ... })`
  // tái sử dụng, không cần đăng nhập lại từ đầu.
  globalSetup: "./global-setup.ts",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Chương 24: firefox/webkit/mobile-chrome CHỈ chạy file cross-browser (testMatch) — chạy
    // lại toàn bộ suite trên cả 3 browser sẽ tốn gấp 3 thời gian CI, trong khi phần lớn test
    // (Chương 11-23) không có lý do đặc biệt để cần verify riêng trên từng engine. Đây là lựa
    // chọn phổ biến trong thực tế: chỉ chạy full cross-browser cho một bộ smoke test đại diện.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
    },
  ],

  webServer: {
    command: "npm start",
    cwd: "../demo-app",
    url: "http://localhost:3000/healthz",
    reuseExistingServer: !process.env.CI,
  },
});
