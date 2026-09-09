# Chương 22: Authentication & storage state (test app có đăng nhập)

## Mục tiêu học

- Lưu trạng thái đăng nhập ra file (`storageState.json`) bằng global setup, chạy một lần cho cả
  test suite.
- Dùng `test.use({ storageState: ... })` để test "đã đăng nhập sẵn" mà không cần đăng nhập lại.
- Khép lại kỹ thuật **seed dữ liệu test** đã hứa từ Chương 1: seed trực tiếp trạng thái tài khoản
  cho TC-07, không cần lặp UI/API nhiều lần.

> Code mẫu: `code/playwright-tests/global-setup.ts` + `tests/ch22-auth-storage-state.spec.ts`.

## 22.1. Storage state là gì, khác `page.request` (Chương 20) thế nào?

Chương 20 dùng `page.request.post("/api/login")` để đăng nhập nhanh — nhưng vẫn phải gọi **trong
từng test** cần đăng nhập. **Storage state** đi xa hơn: đăng nhập **một lần duy nhất** (thường ở
bước chuẩn bị trước khi test suite chạy), lưu cookie ra file, rồi **mọi test** chỉ cần "nạp" file
đó vào là đã ở trạng thái đăng nhập — không gọi API hay điền form lần nào nữa.

## 22.2. Global setup — chạy một lần cho cả test suite

```ts
// global-setup.ts
import { request as playwrightRequest } from "@playwright/test";

async function globalSetup() {
  const requestContext = await playwrightRequest.newContext({ baseURL: "http://localhost:3000" });

  await requestContext.post("/api/test/reset");
  const res = await requestContext.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  if (!(await res.json()).ok) throw new Error("Global setup: đăng nhập thất bại");

  await requestContext.storageState({ path: "storageState.json" }); // lưu cookie ra file
  await requestContext.dispose();
}

export default globalSetup;
```

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: "./global-setup.ts",
  // ...
});
```

Khác `beforeAll` (Chương 12, chạy một lần **cho mỗi `describe`**), `globalSetup` chạy **đúng một
lần cho toàn bộ lần chạy `npm test`**, trước cả file test đầu tiên. Vì `webServer` (Chương 9) khởi
động trước khi test run bắt đầu, tới lúc `globalSetup` chạy, demo app đã sẵn sàng nhận request.

## 22.3. Dùng storage state trong test

```ts
test.use({ storageState: "storageState.json" });

test("đã đăng nhập sẵn — mở thẳng /dashboard không cần qua /login", async ({ page }) => {
  await page.goto("/dashboard"); // KHÔNG có bước điền form đăng nhập nào ở đây
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});
```

`test.use({ storageState: "..." })` đặt ở đầu file (hoặc trong `describe`) áp dụng cho **mọi test**
trong phạm vi đó — Playwright tự nạp cookie từ file vào browser context trước khi mỗi test bắt đầu,
không cần gọi gì thêm.

### Khi nào KHÔNG nên dùng storage state?

Test **về chính hành vi đăng nhập** (như TC-01 → TC-09, Chương 11) phải **không** dùng storage
state — vì mục đích của chúng chính là kiểm tra luồng đăng nhập, dùng session có sẵn sẽ bỏ qua
đúng phần cần test. Trong `ch22-auth-storage-state.spec.ts`, test cho TC-07 ghi đè lại bằng
`test.use({ storageState: { cookies: [], origins: [] } })` — nạp một storage state **rỗng**, đảm
bảo test đó bắt đầu từ trạng thái chưa đăng nhập, độc lập với `test.use` ở đầu file.

## 22.4. Khép lại lời hứa từ Chương 1: seed dữ liệu cho TC-07

Nhắc lại ghi chú ở `code/ch01-sdlc/test-case-list-login.md`: *"TC-07 (khoá tài khoản) là ví dụ về
case cần dữ liệu/trạng thái đặc biệt — sẽ được dùng làm ví dụ cho kỹ thuật seed dữ liệu test ở Phần
V."* Chương 11 tự động hoá TC-07 bằng cách **lặp 5 lần** đăng nhập sai qua UI — đúng nhưng chậm,
và không rõ ràng "5 lần sai" hay "kiểm tra hành vi ở lần thứ 5" mới là điều test thực sự muốn xác
minh.

Chương này thêm endpoint test-only để **seed trực tiếp** trạng thái "đã sai 4 lần":

```js
// server.js
app.post("/api/test/seed-failed-attempts", (req, res) => {
  const { email, count } = req.body || {};
  const user = setFailedAttempts(email || "demo@example.com", count ?? 0);
  // ...
  res.json({ ok: true });
});
```

```ts
// test chỉ cần đăng nhập sai ĐÚNG 1 LẦN để kiểm tra hành vi khoá — nhanh và rõ ý hơn nhiều
await request.post("/api/test/seed-failed-attempts", {
  data: { email: "demo@example.com", count: 4 },
});
// ... đăng nhập sai 1 lần, xác nhận bị khoá
```

Đây chính xác là kỹ thuật **seed dữ liệu test**: thay vì tái tạo toàn bộ chuỗi hành động dẫn tới
một trạng thái, tạo trực tiếp trạng thái đó — nhanh hơn, và test đọc rõ ý định hơn ("test hành vi ở
lần sai thứ 5", không phải "test cả 5 lần sai").

## Bài tập

1. Chạy `npm test`, xác nhận toàn bộ 40 test pass, và `storageState.json` được tạo ra ở thư mục
   `code/playwright-tests/` sau khi chạy (đã có trong `.gitignore`, không commit).
2. Xoá `storageState.json`, chạy `npx playwright test ch22-auth-storage-state` — quan sát
   `globalSetup` tự tạo lại file đó trước khi test chạy.
3. So sánh 2 cách tự động hoá TC-07: vòng lặp 5 lần (Chương 11, `ch11-login-test-cases.spec.ts`)
   và seed trực tiếp (chương này) — viết ra 1 tình huống mà cách lặp vẫn cần thiết (không thể seed
   thay được).
4. Thêm một endpoint test-only mới `/api/test/seed-profile` để seed sẵn dữ liệu hồ sơ (Chương 13),
   dùng nó viết một test xác nhận trang `/profile` hiển thị đúng dữ liệu đã seed mà không cần điền
   form trước.

## Lỗi thường gặp

- **Dùng storage state cho test đang kiểm tra chính luồng đăng nhập**: bỏ qua đúng phần cần test —
  xem cảnh báo ở mục 22.3.
- **Commit `storageState.json` vào git**: đây là dữ liệu sinh ra (chứa cookie session), không nên
  commit — đã thêm vào `.gitignore`.
- **Seed dữ liệu qua endpoint test-only nhưng để lộ ra production**: các route như
  `/api/test/reset`, `/api/test/seed-failed-attempts` chỉ nên tồn tại trong môi trường test/dev —
  một dự án thật cần đảm bảo các route này **không** được build/deploy lên production.

## Tóm tắt & tiếp theo

- `globalSetup` chạy một lần cho cả test suite — phù hợp để tạo storage state dùng chung.
- `test.use({ storageState: ... })` cho test "đã đăng nhập sẵn"; ghi đè bằng storage state rỗng
  cho test cần bắt đầu từ trạng thái chưa đăng nhập.
- Seed dữ liệu trực tiếp qua endpoint test-only nhanh và rõ ý hơn nhiều so với tái tạo toàn bộ
  chuỗi hành động dẫn tới trạng thái đó.

Chương 23 quay lại giải quyết đúng cách vấn đề đã tạm né từ Chương 11 (`workers: 1`) — chạy test
song song an toàn, dùng chính kỹ thuật seed dữ liệu vừa học ở chương này.
