import path from "path";
import { test, expect } from "@playwright/test";

// Minh hoạ thao tác với các loại input khác nhau trên trang Hồ sơ (/profile):
// text input, textarea, <select> dropdown, checkbox, và upload file.

test.beforeEach(async ({ request, page }) => {
  await request.post("/api/test/reset");
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.getByRole("link", { name: "Hồ sơ" }).click();
  await expect(page).toHaveURL("/profile");
});

test("cập nhật tên hiển thị và giới thiệu (text input + textarea)", async ({ page }) => {
  await page.getByLabel("Tên hiển thị").fill("Trần Văn A");
  await page.getByLabel("Giới thiệu").fill("QA Engineer, thích viết automation test.");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();

  await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");

  // Tải lại trang, xác nhận dữ liệu đã LƯU THẬT (không chỉ hiển thị tạm trên UI).
  await page.reload();
  await expect(page.getByLabel("Tên hiển thị")).toHaveValue("Trần Văn A");
  await expect(page.getByLabel("Giới thiệu")).toHaveValue("QA Engineer, thích viết automation test.");
});

test("chọn quốc gia bằng dropdown", async ({ page }) => {
  await page.getByLabel("Quốc gia").selectOption("JP");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();

  await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");
  await page.reload();
  await expect(page.getByLabel("Quốc gia")).toHaveValue("JP");
});

test("bật/tắt checkbox nhận thông báo", async ({ page }) => {
  const checkbox = page.getByLabel("Nhận email thông báo");
  await expect(checkbox).not.toBeChecked(); // mặc định tắt

  await checkbox.check();
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");

  await page.reload();
  await expect(page.getByLabel("Nhận email thông báo")).toBeChecked();

  await page.getByLabel("Nhận email thông báo").uncheck();
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await page.reload();
  await expect(page.getByLabel("Nhận email thông báo")).not.toBeChecked();
});

test("upload ảnh đại diện", async ({ page }) => {
  const filePath = path.join(__dirname, "..", "fixtures", "avatar.png");

  await page.getByLabel("Ảnh đại diện").setInputFiles(filePath);
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();

  await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");
  await expect(page.locator("#avatar-filename")).toHaveText("avatar.png");

  await page.reload();
  await expect(page.locator("#avatar-filename")).toHaveText("avatar.png"); // đã lưu thật
});

test("bỏ trống tên hiển thị bị chặn, hiển thị lỗi validation", async ({ page }) => {
  await page.getByLabel("Tên hiển thị").fill("");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();

  await expect(page.locator("#displayName-error")).toHaveText("Tên hiển thị là bắt buộc");
  await expect(page.locator("#server-success")).toBeHidden();
});
