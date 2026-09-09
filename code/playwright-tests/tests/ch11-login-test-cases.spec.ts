import { test, expect } from "@playwright/test";

// Tự động hoá ĐẦY ĐỦ bộ test case ở Chương 1 (code/ch01-sdlc/test-case-list-login.md).
// Mỗi test dưới đây map 1-1 với một TC-xx trong file đó — đọc song song để đối chiếu.
// Minh hoạ locators (getByLabel/getByRole/getByText), actions (fill/click/press), và
// assertions (expect tự động chờ, không cần waitForTimeout — xem lại Vấn đề 1, Chương 6).

test.beforeEach(async ({ request, page }) => {
  await request.post("/api/test/reset");
  await page.goto("/login");
});

test("TC-01: đăng nhập thành công với tài khoản hợp lệ", async ({ page }) => {
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});

test("TC-02: đăng nhập thất bại với sai mật khẩu", async ({ page }) => {
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("SaiRoi123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
});

test("TC-03: đăng nhập thất bại với email không tồn tại", async ({ page }) => {
  await page.getByLabel("Email").fill("khongton@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // Cùng thông báo với TC-02 — không tiết lộ email có tồn tại hay không (đã học ở Chương 3).
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
});

test("TC-04: bỏ trống trường email", async ({ page }) => {
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("#email-error")).toHaveText("Email là bắt buộc");
  await expect(page).toHaveURL(/\/login/); // không có network request nào được gửi
});

test("TC-05: bỏ trống trường mật khẩu", async ({ page }) => {
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("#password-error")).toHaveText("Mật khẩu là bắt buộc");
});

test("TC-06: sai định dạng email", async ({ page }) => {
  await page.getByLabel("Email").fill("khong-phai-email");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("#email-error")).toHaveText("Email không đúng định dạng");
});

test("TC-07: khoá tài khoản sau 5 lần đăng nhập sai", async ({ page }) => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    await page.getByLabel("Email").fill("demo@example.com");
    await page.getByLabel("Mật khẩu").fill("SaiRoi" + attempt);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
  }

  await expect(page.getByText("Tài khoản tạm khoá, thử lại sau 15 phút")).toBeVisible();
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeDisabled();
});

test("TC-08: mật khẩu được ẩn theo mặc định, có thể hiện", async ({ page }) => {
  const passwordInput = page.getByLabel("Mật khẩu");
  await passwordInput.fill("Password123!");

  await expect(passwordInput).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Hiện ký tự" }).click();

  await expect(passwordInput).toHaveAttribute("type", "text");
  await expect(passwordInput).toHaveValue("Password123!");
});

test("TC-09: đăng nhập bằng phím Enter (không bấm nút)", async ({ page }) => {
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByLabel("Mật khẩu").press("Enter");

  await expect(page).toHaveURL("/dashboard");
});

test("TC-10: redirect về trang trước đó sau khi đăng nhập", async ({ page }) => {
  await page.goto("/orders"); // chưa đăng nhập -> bị chuyển về /login?redirect=/orders
  await expect(page).toHaveURL("/login?redirect=%2Forders");

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL("/orders"); // không phải /dashboard mặc định
});
