import { test, expect } from "../fixtures";

// Dùng `isolatedLoggedInPage` (dựa trên fixture worker-scoped `workerAccount`, Chương 26) —
// mỗi worker tự có tài khoản riêng, tạo ĐÚNG 1 LẦN, an toàn khi chạy song song (nối lại kỹ
// thuật Chương 23), không phải lo đụng độ với `loggedInPage` (dùng demo@example.com chung).

test.describe.configure({ mode: "parallel" });

for (let i = 0; i < 3; i++) {
  test(`test #${i}: mỗi worker dùng lại ĐÚNG một tài khoản đã tạo`, async ({
    isolatedLoggedInPage,
    workerAccount,
  }) => {
    await expect(isolatedLoggedInPage.locator("#username")).toHaveText(workerAccount.email);
  });
}
