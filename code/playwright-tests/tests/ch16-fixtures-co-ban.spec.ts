import { test, expect } from "../fixtures"; // import từ fixtures.ts CỦA CHÚNG TA, không phải @playwright/test

// So sánh với ch12-cau-truc-test.spec.ts: cùng kịch bản (test khu vực sau đăng nhập),
// nhưng không còn `test.beforeEach` gọi login() thủ công — chỉ cần khai báo tham số
// `loggedInPage` trong mỗi test, fixture tự lo phần đăng nhập + dọn dẹp.

test("hiển thị đúng tên người dùng trên Dashboard (qua fixture)", async ({ loggedInPage }) => {
  await expect(loggedInPage.locator("#username")).toHaveText("demo@example.com");
});

test("điều hướng sang Đơn hàng (qua fixture)", async ({ loggedInPage }) => {
  await loggedInPage.getByRole("link", { name: "Đơn hàng" }).click();
  await expect(loggedInPage).toHaveURL("/orders");
});

// Test này KHÔNG cần đăng nhập — không khai báo `loggedInPage`, dùng `page` gốc của
// Playwright như bình thường. Fixture chỉ chạy khi có test THỰC SỰ yêu cầu nó.
test("trang login hiển thị đúng tiêu đề (không cần fixture đăng nhập)", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});
