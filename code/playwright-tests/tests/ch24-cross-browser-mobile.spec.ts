import { test, expect } from "@playwright/test";

// File này chạy trên CẢ 4 project khai báo trong playwright.config.ts: chromium, firefox,
// webkit, và mobile-chrome (giả lập Pixel 7) — xem testMatch trong config. Cùng một bộ test,
// một API duy nhất (getByLabel/getByRole/expect — không đổi gì), chạy được trên cả 3 engine
// trình duyệt khác nhau và một viewport di động.

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

test("đăng nhập hoạt động đúng trên mọi engine trình duyệt", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});

test("form đăng nhập hiển thị đầy đủ, không bị cắt trên viewport di động", async ({
  page,
  isMobile,
}) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();

  const viewport = page.viewportSize();
  const formBox = await page.locator("#login-form").boundingBox();

  expect(formBox).not.toBeNull();
  // Form không được rộng hơn viewport — dấu hiệu layout bị vỡ/tràn ngang trên màn hình nhỏ.
  expect(formBox!.width).toBeLessThanOrEqual(viewport!.width);

  if (isMobile) {
    // `isMobile` (fixture có sẵn) chỉ true khi project dùng device có isMobile:true
    // (như "Pixel 7") — nhánh này chỉ chạy trên project mobile-chrome.
    expect(viewport!.width).toBeLessThan(500);
  }
});
