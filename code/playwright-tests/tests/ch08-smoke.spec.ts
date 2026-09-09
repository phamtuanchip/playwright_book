import { test, expect } from "@playwright/test";

// Test "khói" (smoke test) đầu tiên của cả sách — mục đích DUY NHẤT là xác nhận
// cài đặt Playwright thành công (Chương 7-8), chưa liên quan gì tới demo app
// (sẽ có từ Chương 9). Cú pháp locators/actions/assertions học đầy đủ ở Chương 11.
test("Playwright đã cài đặt và chạy được", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);
});
