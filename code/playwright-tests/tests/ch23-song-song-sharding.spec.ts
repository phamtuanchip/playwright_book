import { test, expect } from "@playwright/test";

// Kỹ thuật ĐÚNG để chạy song song an toàn (đã hứa từ Chương 11 và 22): mỗi WORKER seed một
// tài khoản RIÊNG (qua /api/test/create-user, Chương 22-23), không dùng chung
// demo@example.com với các chương trước — nên nhóm test này chạy được với nhiều worker cùng
// lúc mà không đụng độ, khác với phần còn lại của suite (vẫn cần workers:1 vì dùng chung
// tài khoản demo).
//
// Chạy thử với nhiều worker để tự kiểm chứng: npx playwright test ch23-song-song-sharding --workers=3

test.describe("Chạy song song an toàn — mỗi worker một tài khoản riêng", () => {
  // Cấu hình toàn cục (playwright.config.ts) đặt fullyParallel:false — mặc định các test
  // trong CÙNG MỘT file chạy tuần tự trong 1 worker. Ghi đè riêng cho nhóm test này để nó
  // thực sự chạy song song (nhiều worker cùng lúc), phục vụ đúng mục đích kiểm chứng của chương.
  test.describe.configure({ mode: "parallel" });

  test.beforeEach(async ({ request }, testInfo) => {
    const email = `worker${testInfo.parallelIndex}@example.com`;
    await request.post("/api/test/create-user", {
      data: { email, password: "Password123!" },
    });
  });

  for (let i = 0; i < 4; i++) {
    test(`test #${i}: đăng nhập vào tài khoản của CHÍNH worker này`, async ({ page }, testInfo) => {
      const email = `worker${testInfo.parallelIndex}@example.com`;

      await page.goto("/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Mật khẩu").fill("Password123!");
      await page.getByRole("button", { name: "Đăng nhập" }).click();

      await expect(page).toHaveURL("/dashboard");
      // Nếu 2 worker lỡ dùng chung 1 tài khoản, dòng dưới sẽ thấy SAI email — đây chính là
      // assertion "tự kiểm chứng" cho việc cách ly dữ liệu giữa các worker có hoạt động đúng.
      await expect(page.locator("#username")).toHaveText(email);

      await page.goto("/profile");
      await page.getByLabel("Tên hiển thị").fill(`Worker ${testInfo.parallelIndex} - test ${i}`);
      await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
      await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");
    });
  }
});
