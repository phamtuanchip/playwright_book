import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// Fixture tuỳ biến: mở rộng `test` gốc của Playwright với một fixture mới tên
// "loggedInPage" — trả về một `page` ĐÃ ĐĂNG NHẬP SẴN. So sánh với cách làm ở Chương 12
// (gọi login() trong mỗi `test.beforeEach`): fixture gọn hơn, và mỗi test CHỈ khai báo
// fixture nào nó cần (test không cần đăng nhập thì không khai báo `loggedInPage`, không
// tốn thời gian đăng nhập vô ích).

type Fixtures = {
  loggedInPage: import("@playwright/test").Page;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page, request }, use) => {
    // --- Phần TRƯỚC use(): chạy trước khi test bắt đầu (giống beforeEach) ---
    await request.post("/api/test/reset");
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("demo@example.com", "Password123!");

    await use(page); // --- test thực sự chạy ở đây, nhận `page` này làm tham số ---

    // --- Phần SAU use(): chạy sau khi test xong, dù pass hay fail (giống afterEach) ---
    await request.post("/api/test/reset");
  },
});

export { expect };
