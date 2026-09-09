import { test as base, expect, request as playwrightRequest } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// Fixture tuỳ biến: mở rộng `test` gốc của Playwright với một fixture mới tên
// "loggedInPage" — trả về một `page` ĐÃ ĐĂNG NHẬP SẴN. So sánh với cách làm ở Chương 12
// (gọi login() trong mỗi `test.beforeEach`): fixture gọn hơn, và mỗi test CHỈ khai báo
// fixture nào nó cần (test không cần đăng nhập thì không khai báo `loggedInPage`, không
// tốn thời gian đăng nhập vô ích).

type TestFixtures = {
  loggedInPage: import("@playwright/test").Page;
  isolatedLoggedInPage: import("@playwright/test").Page;
};

// Chương 26: fixture WORKER-SCOPED — khác `loggedInPage` (chạy lại cho MỖI test),
// `workerAccount` chỉ tạo tài khoản ĐÚNG MỘT LẦN cho mỗi worker, dùng lại cho mọi test
// trong worker đó. Kết hợp kỹ thuật "mỗi worker 1 tài khoản riêng" (Chương 23) với fixture
// (Chương 16) — vừa an toàn khi chạy song song, vừa không tốn công tạo lại tài khoản mỗi test.
type WorkerFixtures = {
  workerAccount: { email: string; password: string };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
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

  workerAccount: [
    async ({}, use, workerInfo) => {
      // Fixture worker-scoped KHÔNG thể dùng fixture `request` (test-scoped) — phải tự tạo
      // một APIRequestContext riêng, giống cách global-setup.ts (Chương 22) làm.
      const email = `worker-account-${workerInfo.workerIndex}@example.com`;
      const password = "Password123!";
      const requestContext = await playwrightRequest.newContext({
        baseURL: "http://localhost:3000",
      });
      await requestContext.post("/api/test/create-user", { data: { email, password } });
      await requestContext.dispose();

      await use({ email, password }); // chạy 1 lần, dùng lại cho MỌI test trong worker này
    },
    { scope: "worker" },
  ],

  isolatedLoggedInPage: async ({ page, workerAccount }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(workerAccount.email, workerAccount.password);
    await use(page);
  },
});

export { expect };
