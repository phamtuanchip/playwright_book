import { test, expect } from "@playwright/test";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";

// Case study (Chương 30): tự động hoá ĐẦY ĐỦ tính năng "Quên mật khẩu" — mới thêm vào demo-app
// cho chính chương này — bằng cách áp dụng lại toàn bộ quy trình đã học qua cả sách:
//   1. Test case (dạng bảng, xem book/part6-ai-mcp/ch30-case-study.md mục 30.2)
//   2. MCP sinh khung test nháp (Chương 28-29) — điểm khởi đầu, không phải sản phẩm cuối
//   3. Page Object (Chương 15) — hoàn thiện khung nháp thành ForgotPasswordPage.ts
//   4. Test thật, có assertion đúng theo test case (Chương 11)
//   5. Chạy qua CI đã có sẵn từ Chương 19, không cần cấu hình gì thêm

test.beforeEach(async ({ page }) => {
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.goto();
});

test("CS-01: gửi yêu cầu với email hợp lệ, hiển thị thông báo thành công", async ({ page }) => {
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.requestReset("demo@example.com");

  await expect(forgotPasswordPage.serverSuccess).toHaveText(
    "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi."
  );
});

test("CS-02: email không tồn tại vẫn nhận CÙNG thông báo (không tiết lộ email có tồn tại)", async ({
  page,
}) => {
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.requestReset("khong-ton-tai@example.com");

  // Cùng assertion, cùng thông báo với CS-01 — đây CHÍNH LÀ điều cần kiểm tra: hệ thống
  // không được để lộ sự khác biệt giữa "email tồn tại" và "email không tồn tại" (nhắc lại
  // nguyên tắc TC-03, Chương 1/3).
  await expect(forgotPasswordPage.serverSuccess).toHaveText(
    "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi."
  );
});

test("CS-03: bỏ trống email bị chặn, hiển thị lỗi validation", async ({ page }) => {
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.requestReset("");

  await expect(forgotPasswordPage.emailError).toHaveText("Email là bắt buộc");
  await expect(forgotPasswordPage.serverSuccess).toBeHidden();
});

test("CS-04: sai định dạng email bị chặn, hiển thị lỗi validation", async ({ page }) => {
  const forgotPasswordPage = new ForgotPasswordPage(page);
  await forgotPasswordPage.requestReset("khong-phai-email");

  await expect(forgotPasswordPage.emailError).toHaveText("Email không đúng định dạng");
});

test("CS-05: link 'Quên mật khẩu?' trên trang đăng nhập điều hướng đúng", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Quên mật khẩu?" }).click();
  await expect(page).toHaveURL("/forgot-password");
});
