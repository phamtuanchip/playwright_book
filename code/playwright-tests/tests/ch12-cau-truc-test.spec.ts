import { test, expect } from "@playwright/test";

// Minh hoạ test.describe + 4 loại hook (beforeAll/afterAll chạy 1 lần cho cả nhóm,
// beforeEach/afterEach chạy trước/sau MỖI test) và test.step (chia nhỏ 1 test thành các
// bước có tên, dễ đọc trong report/trace — xem Chương 17).

test.describe("Khu vực sau đăng nhập (Dashboard & Đơn hàng)", () => {
  test.beforeAll(() => {
    // Chạy đúng 1 lần, TRƯỚC toàn bộ test trong describe này — phù hợp cho việc log,
    // KHÔNG phù hợp để làm sạch dữ liệu (mỗi test vẫn cần dữ liệu sạch riêng, xem beforeEach).
    console.log("Bắt đầu nhóm test: Dashboard & Đơn hàng");
  });

  test.afterAll(() => {
    console.log("Kết thúc nhóm test: Dashboard & Đơn hàng");
  });

  test.beforeEach(async ({ request, page }) => {
    // Chạy TRƯỚC MỖI test — đảm bảo mỗi test bắt đầu từ trạng thái "đã đăng nhập" giống nhau,
    // độc lập với các test khác (nguyên tắc đã học ở Chương 6, Vấn đề 5).
    await request.post("/api/test/reset");
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@example.com");
    await page.getByLabel("Mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test.afterEach(async ({}, testInfo) => {
    // Chạy SAU MỖI test — testInfo cho biết test vừa chạy pass/fail, hữu ich để log hoặc
    // (ở Chương 17) tự động lưu thêm ảnh chụp màn hình khi fail.
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`Test "${testInfo.title}" FAILED — xem trace để debug (Chương 17)`);
    }
  });

  test("hiển thị đúng tên người dùng trên Dashboard", async ({ page }) => {
    await expect(page.locator("#username")).toHaveText("demo@example.com");
  });

  test("điều hướng sang trang Đơn hàng", async ({ page }) => {
    await test.step("Click vào link Đơn hàng", async () => {
      await page.getByRole("link", { name: "Đơn hàng" }).click();
    });
    await test.step("Xác nhận đã ở trang Đơn hàng", async () => {
      await expect(page).toHaveURL("/orders");
      await expect(page.locator("#orders-empty")).toBeVisible();
    });
  });

  test("đăng xuất quay lại trang đăng nhập", async ({ page }) => {
    await page.getByRole("link", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL("/login");
  });
});
