// VÍ DỤ MINH HOẠ (chưa chạy được — cần cài Playwright ở Chương 7-8, cú pháp đầy đủ học ở Chương
// 11-15). Cùng test đăng nhập với bad-example.spec.ts, viết lại theo tư duy automation QA vững:
// mỗi số "Sửa N" tương ứng với "Vấn đề N" bên file kia.

import { test, expect } from "@playwright/test";

// Sửa 4: tách logic dùng chung ra hàm riêng — mọi test gọi lại, sửa một chỗ áp dụng khắp nơi.
// (Đây chính là mầm mống của Page Object Model — sẽ học đầy đủ ở Chương 15.)
async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login"); // dùng baseURL cấu hình sẵn, không hard-code domain trong từng test
  // Sửa 2: locator theo vai trò/nhãn người dùng nhìn thấy — ổn định trước thay đổi cấu trúc DOM,
  // và chính là cách Playwright khuyến nghị (getByLabel/getByRole — học chi tiết ở Chương 11).
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

// Sửa 5: mỗi test độc lập hoàn toàn — Playwright Test tự tạo browser context RIÊNG cho mỗi
// test theo mặc định, không còn lo session/cookie rò rỉ giữa các test.
test("TC-01: đăng nhập thành công với tài khoản hợp lệ", async ({ page }) => {
  await login(page, "demo@example.com", "Password123!");

  // Sửa 1: không waitForTimeout — expect() của Playwright tự động chờ (auto-waiting, học ở
  // Chương 14) tới khi điều kiện đúng hoặc hết timeout, không đoán mò thời gian.
  // Sửa 3: assertion cụ thể, đúng với "Kết quả mong đợi" của TC-01 (Chương 1): chuyển đúng
  // sang /dashboard, KHÔNG chỉ kiểm tra "có URL nào đó".
  await expect(page).toHaveURL("/dashboard");
});

test("TC-02: đăng nhập thất bại với sai mật khẩu", async ({ page }) => {
  await login(page, "demo@example.com", "SaiRoi123");

  // Sửa 3 (lặp lại ở test này): kiểm tra ĐÚNG nội dung thông báo lỗi theo Test Case Chương 1,
  // không chỉ "có hiển thị lỗi nào đó".
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
  await expect(page).toHaveURL(/\/login/); // vẫn ở lại trang login, không bị chuyển hướng nhầm
});
