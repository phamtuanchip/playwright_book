import { test, expect } from "@playwright/test";

// Kỹ thuật storage state: KHÔNG cần đăng nhập lại trong từng test — dùng cookie đã lưu sẵn ở
// storageState.json (tạo một lần bởi global-setup.ts, xem playwright.config.ts).

test.use({ storageState: "storageState.json" });

test("đã đăng nhập sẵn nhờ storageState — mở thẳng /dashboard không cần qua /login", async ({
  page,
}) => {
  await page.goto("/dashboard"); // KHÔNG có bước điền form đăng nhập nào ở đây
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});

test("storageState vẫn hoạt động khi điều hướng sang trang khác cần đăng nhập", async ({
  page,
}) => {
  await page.goto("/orders");
  await expect(page).toHaveURL("/orders"); // không bị redirect về /login
});

// Test riêng cho TC-07, KHÔNG dùng storageState (vì mục đích là test chính luồng đăng nhập,
// không phải "đã đăng nhập sẵn") — dùng kỹ thuật SEED trực tiếp thay vì lặp 4 lần sai như
// Chương 11, đúng như ghi chú đã hứa từ Chương 1.
test.describe("TC-07 (seed trực tiếp, không lặp UI)", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // không dùng session đã đăng nhập

  test("seed sẵn 4 lần sai — chỉ cần đăng nhập sai đúng 1 lần để kiểm tra khoá", async ({
    page,
    request,
  }) => {
    await request.post("/api/test/reset");
    // Seed thẳng trạng thái "đã sai 4 lần" — nhanh hơn NHIỀU so với vòng lặp 5 lần ở Chương 11,
    // và test này chỉ cần quan tâm ĐÚNG hành vi ở lần sai thứ 5, không cần lặp lại 4 lần đầu.
    await request.post("/api/test/seed-failed-attempts", {
      data: { email: "demo@example.com", count: 4 },
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@example.com");
    await page.getByLabel("Mật khẩu").fill("SaiLanCuoi");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.locator("#server-error")).toHaveText("Tài khoản tạm khoá, thử lại sau 15 phút");
  });
});
