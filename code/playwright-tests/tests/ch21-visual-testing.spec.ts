import { test, expect } from "@playwright/test";

// Visual testing: so sánh ẢNH CHỤP MÀN HÌNH với một ảnh "baseline" đã lưu trước, phát hiện
// thay đổi UI mà assertion văn bản (Chương 11-20) không thấy được (ví dụ: đổi màu, đổi
// khoảng cách, vỡ layout do CSS lỗi — mọi thứ vẫn "đúng nội dung text" nhưng nhìn sai).
//
// QUAN TRỌNG: ảnh baseline (.png trong ch21-visual-testing.spec.ts-snapshots/) được tạo lần
// đầu trên máy Windows khi viết chương này — ảnh chụp màn hình PHỤ THUỘC hệ điều hành (font
// rendering, anti-aliasing khác nhau giữa Windows/Linux/macOS). CI (Chương 19) chạy trên
// ubuntu-latest, nên baseline tạo trên Windows sẽ KHÔNG khớp — bỏ qua nhóm test này trên CI,
// xem giải thích đầy đủ ở Chương 21.
test.describe("Visual testing (chỉ chạy local — xem lý do trong Chương 21)", () => {
  test.skip(
    !!process.env.CI,
    "Baseline ảnh được tạo trên Windows, không khớp ubuntu-latest trên CI (khác OS)"
  );

  test.beforeEach(async ({ request }) => {
    await request.post("/api/test/reset");
  });

  test("giao diện trang đăng nhập không đổi ngoài ý muốn", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveScreenshot("login-page.png");
  });

  test("giao diện form đăng nhập (chỉ 1 phần tử, không phải cả trang)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#login-form")).toHaveScreenshot("login-form.png");
  });
});
