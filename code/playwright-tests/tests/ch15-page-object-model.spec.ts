import path from "path";
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";

// So sánh với ch11-login-test-cases.spec.ts: các test dưới đây kiểm tra ĐÚNG những kịch bản
// tương tự (TC-01, TC-02), nhưng gọi qua LoginPage thay vì lặp lại locator trực tiếp — code
// test đọc gần như "ngôn ngữ tự nhiên", và nếu form đăng nhập đổi cấu trúc, chỉ cần sửa
// pages/LoginPage.ts, không cần đụng vào từng test.

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

test("TC-01 (viết lại bằng POM): đăng nhập thành công", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("demo@example.com", "Password123!");

  await expect(page).toHaveURL("/dashboard");
});

test("TC-02 (viết lại bằng POM): sai mật khẩu hiển thị lỗi", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("demo@example.com", "SaiRoi123");

  await expect(loginPage.serverError).toHaveText("Email hoặc mật khẩu không đúng");
});

test("kết hợp 2 Page Object trong 1 test: đăng nhập rồi cập nhật hồ sơ", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);

  await loginPage.goto();
  await loginPage.login("demo@example.com", "Password123!");
  await expect(page).toHaveURL("/dashboard");

  await profilePage.goto();
  await profilePage.fillDisplayName("Trần Văn A (qua POM)");
  await profilePage.selectCountry("US");
  await profilePage.setNotifications(true);
  await profilePage.uploadAvatar(path.join(__dirname, "..", "fixtures", "avatar.png"));
  await profilePage.save();

  await expect(profilePage.serverSuccess).toHaveText("Đã lưu hồ sơ.");
});
