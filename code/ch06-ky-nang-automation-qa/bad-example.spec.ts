// VÍ DỤ MINH HOẠ (chưa chạy được — cần cài Playwright ở Chương 7-8, cú pháp đầy đủ học ở Chương
// 11). Đây là một test đăng nhập viết theo tư duy "automation QA còn non", để đối chiếu với
// good-example.spec.ts. Đọc phần "Vấn đề" ghi chú bên cạnh mỗi đoạn.

import { test, expect } from "@playwright/test";

test("dang nhap", async ({ page }) => {
  await page.goto("https://staging.demo-app.local/login");

  // Vấn đề 1: "sleep cứng" (hard wait) — đoán mò thời gian chờ thay vì chờ đúng điều kiện.
  // Trên máy chậm, 2 giây có thể không đủ (test flaky); trên máy nhanh, tốn 2 giây vô ích.
  await page.waitForTimeout(2000);

  // Vấn đề 2: locator dựa vào cấu trúc DOM (nth-child, class CSS nội bộ) — vỡ ngay khi
  // dev đổi layout dù hành vi không đổi gì. Không phản ánh cách người dùng thật nhìn thấy trang.
  await page.locator("div.form > div:nth-child(1) > input").fill("demo@example.com");
  await page.locator("div.form > div:nth-child(2) > input").fill("Password123!");
  await page.locator("div.form > button.btn.btn-primary").click();

  await page.waitForTimeout(2000); // Vấn đề 1 lặp lại — chờ mù sau khi submit

  // Vấn đề 3: assertion mơ hồ, không xác minh đúng cái Test Case (TC-01, Chương 1) yêu cầu.
  // "trang có tồn tại URL nào đó" không chứng minh đăng nhập THÀNH CÔNG.
  expect(page.url()).toBeTruthy();
});

test("dang nhap sai", async ({ page }) => {
  // Vấn đề 4: lặp lại y hệt logic goto + fill ở test trên (không tái sử dụng) — sửa 1 chỗ
  // (vd đổi URL staging) phải sửa ở mọi test, dễ sót.
  await page.goto("https://staging.demo-app.local/login");
  await page.waitForTimeout(2000);
  await page.locator("div.form > div:nth-child(1) > input").fill("demo@example.com");
  await page.locator("div.form > div:nth-child(2) > input").fill("SaiRoi123");
  await page.locator("div.form > button.btn.btn-primary").click();
  await page.waitForTimeout(2000);

  // Vấn đề 5: test phụ thuộc thứ tự chạy — nếu test "dang nhap" ở trên chạy trước và để lại
  // session đăng nhập (cookie), test này có thể fail hoặc pass sai lý do vì đã có session cũ.
  const errorVisible = await page.locator(".error-message").isVisible();
  expect(errorVisible).toBe(true); // Vấn đề 3 lặp lại: không kiểm tra ĐÚNG nội dung lỗi
});
