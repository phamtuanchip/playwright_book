import { test, expect } from "@playwright/test";
import { resilientLocate } from "../utils/resilient-locate";

// Minh hoạ self-healing KHÔNG dùng AI: giả lập tình huống "dev đổi ID của input email"
// (rất thường gặp khi UI thay đổi) — chiến lược locator ưu tiên cao nhất (#email-old, cố
// tình sai) không tìm được phần tử, resilientLocate tự chuyển sang chiến lược dự phòng
// (getByLabel) mà KHÔNG cần sửa code test nào khi chạy lại.

test.beforeEach(async ({ request, page }) => {
  await request.post("/api/test/reset");
  await page.goto("/login");
});

test("resilientLocate tự chuyển sang chiến lược dự phòng khi locator chính không còn đúng", async ({
  page,
}) => {
  const { locator: emailInput, strategyUsed } = await resilientLocate(page, [
    { name: "css cũ (#email-old) — giả lập ID đã đổi khi UI thay đổi", locate: () => page.locator("#email-old") },
    { name: "getByLabel Email — chiến lược dự phòng, ổn định hơn", locate: () => page.getByLabel("Email") },
  ]);

  expect(strategyUsed).toBe("getByLabel Email — chiến lược dự phòng, ổn định hơn");

  await emailInput.fill("demo@example.com");
  await expect(emailInput).toHaveValue("demo@example.com");
});

test("chiến lược đầu tiên đúng thì KHÔNG cần rơi xuống chiến lược dự phòng", async ({ page }) => {
  const { strategyUsed } = await resilientLocate(page, [
    { name: "getByLabel Email — đúng ngay từ đầu", locate: () => page.getByLabel("Email") },
    { name: "dự phòng (không nên cần dùng tới)", locate: () => page.locator("#khong-ton-tai") },
  ]);

  expect(strategyUsed).toBe("getByLabel Email — đúng ngay từ đầu");
});

test("nếu KHÔNG chiến lược nào đúng, báo lỗi rõ ràng thay vì treo im lặng", async ({ page }) => {
  await expect(
    resilientLocate(
      page,
      [
        { name: "sai 1", locate: () => page.locator("#sai-1") },
        { name: "sai 2", locate: () => page.locator("#sai-2") },
      ],
      500
    )
  ).rejects.toThrow(/không chiến lược nào tìm được/);
});
