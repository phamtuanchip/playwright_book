import { test, expect } from "@playwright/test";

// API testing thuần (không mở trình duyệt) + kỹ thuật kết hợp API để chuẩn bị trạng thái
// (đăng nhập) nhanh hơn, rồi mới dùng UI để kiểm tra phần thực sự cần test bằng trình duyệt.

test.beforeEach(async ({ request }) => {
  await request.post("/api/test/reset");
});

test("POST /api/login trả về ok:true với thông tin đúng", async ({ request }) => {
  const res = await request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test("POST /api/login trả về ok:false với sai mật khẩu", async ({ request }) => {
  const res = await request.post("/api/login", {
    data: { email: "demo@example.com", password: "sai" },
  });

  const body = await res.json();
  expect(body.ok).toBe(false);
  expect(body.message).toBe("Email hoặc mật khẩu không đúng");
});

test("request fixture độc lập KHÔNG chia sẻ cookie với page", async ({ page, request }) => {
  const res = await request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  expect((await res.json()).ok).toBe(true);

  // `request` là một APIRequestContext RIÊNG, không gắn với browser context của `page` —
  // cookie session set ở trên KHÔNG có trong `page`, nên vẫn bị coi là chưa đăng nhập.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("page.request CÓ chia sẻ cookie với page — đăng nhập qua API rồi kiểm tra UI", async ({
  page,
}) => {
  // `page.request` dùng CHUNG browser context với `page` — cookie session set ở đây
  // sẽ có hiệu lực ngay khi `page` điều hướng, không cần điền form đăng nhập qua UI.
  const res = await page.request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  expect((await res.json()).ok).toBe(true);

  await page.goto("/dashboard");
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});
