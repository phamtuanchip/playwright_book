import { test, expect } from "@playwright/test";

// Test "khói" cho demo app (Chương 9) — xác nhận luồng đăng nhập cơ bản hoạt động qua UI
// thật trước khi Chương 11 dạy chi tiết locators/actions/assertions. Chạy: npm test
// (yêu cầu baseURL + webServer đã cấu hình trong playwright.config.ts trỏ tới ../demo-app).

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

test("đăng nhập thành công chuyển sang /dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});

test("đăng nhập sai mật khẩu hiển thị lỗi, vẫn ở /login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("SaiRoi123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.locator("#server-error")).toHaveText("Email hoặc mật khẩu không đúng");
  await expect(page).toHaveURL(/\/login/);
});

test("truy cập /orders khi chưa đăng nhập bị chuyển về /login kèm redirect", async ({ page }) => {
  await page.goto("/orders");
  await expect(page).toHaveURL("/login?redirect=%2Forders");
});
