import { test, expect } from "@playwright/test";

// Minh hoạ: auto-waiting xử lý được cả độ trễ mạng thật (không cần code thêm), cách chờ
// đúng một network response cụ thể, và cách giả lập lỗi server để test hành vi UI khi
// backend gặp sự cố — điều gần như không thể tái hiện ổn định qua backend thật.

test.beforeEach(async ({ request, page }) => {
  await request.post("/api/test/reset");
  await page.goto("/login");
});

test("auto-waiting tự chờ khi network chậm, không cần waitForTimeout", async ({ page }) => {
  await page.route("**/api/login", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // giả lập mạng chậm 1.5s
    await route.continue();
  });

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // KHÔNG cần page.waitForTimeout(1500) — expect() tự động chờ tới khi đúng
  // (timeout mặc định 5s, đủ cho độ trễ 1.5s giả lập ở trên).
  await expect(page).toHaveURL("/dashboard");
});

test("waitForResponse: chờ và kiểm tra đúng network request đã gửi", async ({ page }) => {
  const responsePromise = page.waitForResponse("**/api/login");

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  const requestBody = JSON.parse(response.request().postData() || "{}");
  expect(requestBody.email).toBe("demo@example.com");
});

test("giả lập lỗi server 500 — UI phải báo lỗi rõ ràng, không được treo im lặng", async ({
  page,
}) => {
  await page.route("**/api/login", (route) =>
    route.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" })
  );

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.locator("#server-error")).toHaveText("Có lỗi xảy ra, vui lòng thử lại.");
});
