import { request as playwrightRequest } from "@playwright/test";

// Global setup: chạy ĐÚNG MỘT LẦN trước khi bắt đầu toàn bộ test run (không phải trước mỗi
// test/file như beforeEach). Ở đây, nó đăng nhập MỘT LẦN qua API, rồi lưu lại cookie session
// vào storageState.json — các test khác (Chương 22) có thể TÁI SỬ DỤNG file này để "đã đăng
// nhập sẵn" ngay khi `page` mở lên, không cần gọi API hay điền form lại từ đầu.
async function globalSetup() {
  const baseURL = "http://localhost:3000";
  const requestContext = await playwrightRequest.newContext({ baseURL });

  await requestContext.post("/api/test/reset");
  const res = await requestContext.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  const body = await res.json();
  if (!body.ok) {
    throw new Error("Global setup: đăng nhập thất bại, không tạo được storageState.json");
  }

  await requestContext.storageState({ path: "storageState.json" });
  await requestContext.dispose();
}

export default globalSetup;
