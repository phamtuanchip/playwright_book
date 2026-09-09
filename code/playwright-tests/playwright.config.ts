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
  reporter: [["html"], ["allure-playwright"]],

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
