# Chương 20: API testing với `request` context (kết hợp UI + API test)

## Mục tiêu học

- Viết API test thuần bằng fixture `request`, không cần mở trình duyệt.
- Phân biệt chính xác `request` (fixture độc lập) và `page.request` (dùng chung context với `page`).
- Dùng API để chuẩn bị trạng thái (đăng nhập) nhanh hơn, chỉ dùng UI cho phần thực sự cần kiểm tra
  qua trình duyệt.

> Code mẫu: `code/playwright-tests/tests/ch20-api-testing.spec.ts` — 4 test, gồm một cặp đối chứng
> trực tiếp chứng minh sự khác biệt giữa `request` và `page.request`.

## 20.1. API test thuần — không cần trình duyệt

```ts
test("POST /api/login trả về ok:true với thông tin đúng", async ({ request }) => {
  const res = await request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
```

Fixture `request` (khác `page`) gọi trực tiếp HTTP request, không mở Chromium/Firefox/WebKit nào —
nhanh hơn nhiều so với test UI cho cùng một hành vi. Đây là lý do Testing Pyramid (Chương 2)
khuyến nghị nhiều integration/API test hơn E2E test: cùng kiểm tra logic đăng nhập, API test chạy
trong vài chục milli-giây, còn test UI (Chương 11) cần vài giây để mở trình duyệt, điền form, chờ
điều hướng.

## 20.2. `request` fixture độc lập KHÔNG chia sẻ cookie với `page`

```ts
test("request fixture độc lập KHÔNG chia sẻ cookie với page", async ({ page, request }) => {
  const res = await request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  expect((await res.json()).ok).toBe(true);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/); // vẫn bị coi là CHƯA đăng nhập!
});
```

Đây là điểm dễ gây nhầm lẫn nhất khi mới học API testing với Playwright: `request` là một
**APIRequestContext hoàn toàn riêng biệt**, không liên quan gì tới trình duyệt mà `page` đang điều
khiển. Cookie session mà `/api/login` trả về (qua `Set-Cookie`) chỉ được `request` context đó lưu
lại nội bộ — `page` không hề biết gì về nó.

## 20.3. `page.request` — dùng chung context với `page`

```ts
test("page.request CÓ chia sẻ cookie với page", async ({ page }) => {
  const res = await page.request.post("/api/login", {
    data: { email: "demo@example.com", password: "Password123!" },
  });
  expect((await res.json()).ok).toBe(true);

  await page.goto("/dashboard"); // ĐÃ có cookie session, vào thẳng Dashboard
  await expect(page.locator("#username")).toHaveText("demo@example.com");
});
```

`page.request` (khác `request` độc lập) là APIRequestContext **gắn với cùng browser context** mà
`page` đang dùng — cookie nhận được từ response sẽ được lưu vào browser context đó, nên `page.goto()`
ngay sau sẽ mang theo cookie này như một request thật từ trình duyệt.

## 20.4. Vì sao kỹ thuật này quan trọng?

So sánh hai cách chuẩn bị "đã đăng nhập" cho một test chỉ cần test tính năng **khác** đăng nhập
(ví dụ test trang Đơn hàng):

| Cách | Thời gian | Rủi ro |
|---|---|---|
| Điền form UI (Chương 11-15) | Vài giây (mở form, điền, chờ điều hướng) | Nếu form đăng nhập có bug, MỌI test khác cũng fail theo, dù không liên quan |
| `page.request.post("/api/login")` | Vài chục milli-giây | Không phụ thuộc UI form đăng nhập — chỉ phụ thuộc API `/api/login` |

Với hàng chục/hàng trăm test cần "đã đăng nhập" làm điều kiện tiền đề (không phải test **về**
đăng nhập), dùng `page.request` để đăng nhập nhanh giúp suite chạy nhanh hơn đáng kể, và tách rời
sự phụ thuộc vào UI form — đúng tinh thần Testing Pyramid: chỉ dùng UI khi thực sự cần kiểm tra UI.

**Lưu ý:** kỹ thuật này khác — và đơn giản hơn — kỹ thuật storage state đầy đủ sẽ học ở Chương 22
(lưu lại trạng thái đăng nhập ra file, dùng lại giữa nhiều lần chạy test khác nhau). Ở đây, mỗi
test tự gọi API đăng nhập riêng, không chia sẻ giữa các test.

## Bài tập

1. Chạy `npm test`, xác nhận toàn bộ 35 test pass.
2. Viết một test API xác nhận `POST /api/test/reset` trả về đúng `{ ok: true }` (hiện chưa có test
   nào kiểm tra trực tiếp endpoint này, dù nó được gọi ở `beforeEach` của gần như mọi file).
3. Dùng `page.request` để viết một test: đăng nhập qua API, sau đó vào `/profile` và xác nhận tên
   hiển thị mặc định đúng là `demo` (giá trị khởi tạo trong `makeDemoProfile()`).
4. Giải thích bằng lời của bạn: vì sao `context.request` (gọi qua `context` thay vì `page`) cũng
   sẽ chia sẻ cookie với mọi `page` được tạo từ `context` đó — thử viết một test xác nhận điều này
   với 2 `page` khác nhau trong cùng một `context`.

## Lỗi thường gặp

- **Dùng `request` (độc lập) khi ý định là `page.request`**: dẫn tới lỗi khó hiểu — API trả về
  `ok: true` nhưng `page` vẫn bị coi là chưa đăng nhập, vì hai context cookie khác nhau (xem mục
  20.2).
- **Coi API test thay thế hoàn toàn cho UI test**: API test xác nhận backend đúng, nhưng không xác
  nhận UI hiển thị đúng, xử lý lỗi đúng phía client (như bug Chương 14) — vẫn cần cả hai.
- **Không dùng `page.request` để tối ưu tốc độ**: với suite lớn, cứ điền form UI để "chuẩn bị điều
  kiện" cho mọi test làm suite chạy chậm không cần thiết.

## Tóm tắt & tiếp theo

- Fixture `request` viết API test thuần, nhanh hơn nhiều so với test UI cho cùng hành vi backend.
- `request` (độc lập) và `page.request` (chung context với `page`) có phạm vi cookie khác nhau —
  dùng đúng loại tuỳ mục đích.
- Dùng API để chuẩn bị trạng thái, chỉ dùng UI cho phần thực sự cần kiểm tra qua trình duyệt.

Chương 21 chuyển sang một loại kiểm thử khác hẳn: visual testing — so sánh ảnh chụp màn hình để
phát hiện thay đổi UI ngoài ý muốn, thứ mà assertion văn bản (đã dùng suốt từ Chương 11) không phát
hiện được.
