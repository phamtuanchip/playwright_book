# Chương 24: Cross-browser testing & mobile emulation

## Mục tiêu học

- Cấu hình nhiều `projects` để chạy cùng bộ test trên Chromium, Firefox, WebKit.
- Giả lập thiết bị di động (viewport, `isMobile`) mà không cần thiết bị thật.
- Quyết định hợp lý: chạy toàn bộ suite hay chỉ một phần trên nhiều browser.

> Code mẫu: `code/playwright-tests/tests/ch24-cross-browser-mobile.spec.ts` — 2 test, chạy thật
> trên cả 4 project (chromium, firefox, webkit, mobile-chrome) = 8 lần chạy, đã xác nhận pass.

## 24.1. Cài thêm Firefox và WebKit

Từ Chương 8, project chỉ cài Chromium. Để test cross-browser thật (không phải nói suông), cần cài
thêm 2 engine còn lại:

```bash
npx playwright install firefox webkit
```

**Lưu ý quan trọng:** "WebKit" ở đây là engine dùng trong Safari — Playwright cho phép test hành
vi giống Safari **trên Windows/Linux**, không cần máy Mac thật. Đây rất hữu ích để phát hiện lỗi
đặc thù Safari sớm, dù đội ngũ không có sẵn máy Mac để test tay.

## 24.2. Khai báo nhiều `projects`

```ts
// playwright.config.ts
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
    testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
    testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
  },
  {
    name: "mobile-chrome",
    use: { ...devices["Pixel 7"] }, // giả lập thiết bị di động thật (viewport, user-agent...)
    testMatch: /ch24-cross-browser-mobile\.spec\.ts/,
  },
],
```

`devices["Pixel 7"]` (và hàng trăm thiết bị khác Playwright hỗ trợ sẵn) cung cấp đúng viewport,
user-agent, tỉ lệ pixel của thiết bị thật — **giả lập**, không phải chạy trên thiết bị/emulator
Android thật, nhưng đủ chính xác cho phần lớn mục đích kiểm thử responsive.

## 24.3. `testMatch` — quyết định quan trọng: KHÔNG chạy mọi test trên mọi browser

Chú ý `testMatch` ở 3 project firefox/webkit/mobile-chrome: chỉ file
`ch24-cross-browser-mobile.spec.ts` chạy trên các project này — **43 test khác** (Chương 11-23)
chỉ chạy trên `chromium`. Đây là quyết định có chủ đích, không phải thiếu sót:

- Chạy **toàn bộ** suite trên cả 4 project sẽ tốn gần **4 lần thời gian CI**.
- Phần lớn logic (validation, API, storage state...) không có lý do đặc biệt để khác nhau giữa
  các engine trình duyệt — nếu Chromium đúng, khả năng cao Firefox/WebKit cũng đúng.
- Thực tế phổ biến: chỉ chạy **một bộ smoke test đại diện** (các luồng quan trọng nhất) trên đa
  browser, còn lại chạy trên một browser chính (thường Chromium, engine phổ biến nhất).

Chạy `npm test` sau khi thêm cấu hình này: 52 test tổng (44 test cũ + 2 test × 4 project mới) —
xác nhận đúng số lượng, không có project nào chạy nhầm file khác.

## 24.4. Kiểm tra riêng cho mobile: fixture `isMobile`

```ts
test("form đăng nhập hiển thị đầy đủ, không bị cắt trên viewport di động", async ({
  page,
  isMobile,
}) => {
  await page.goto("/login");
  const viewport = page.viewportSize();
  const formBox = await page.locator("#login-form").boundingBox();

  expect(formBox!.width).toBeLessThanOrEqual(viewport!.width); // không tràn ngang

  if (isMobile) {
    expect(viewport!.width).toBeLessThan(500); // nhánh riêng, chỉ chạy trên mobile-chrome
  }
});
```

`isMobile` là fixture có sẵn của Playwright, tự động `true`/`false` tuỳ project đang chạy có khai
báo `isMobile: true` trong device descriptor hay không (`devices["Pixel 7"]` có, `devices["Desktop
Chrome"]` không) — cho phép viết logic khác nhau cho mobile ngay trong cùng một test, không cần
file riêng.

## Bài tập

1. Chạy `npm test`, xác nhận 52 test pass — trong đó đúng 8 test (2 × 4 project) thuộc
   `ch24-cross-browser-mobile.spec.ts`.
2. Chạy riêng `npx playwright test ch24-cross-browser-mobile --project=webkit` — chỉ chạy trên
   WebKit, thời gian nhanh hơn chạy cả 4 project.
3. Thử đổi `devices["Pixel 7"]` thành `devices["iPhone 15"]` — chạy lại, xác nhận vẫn pass (viewport
   khác nhưng cùng logic `isMobile`).
4. Thêm một project mới `tablet` dùng `devices["iPad Pro 11"]`, viết test riêng kiểm tra viewport
   tablet không kích hoạt nhánh `isMobile` (vì iPad thường không đặt `isMobile: true`).

## Lỗi thường gặp

- **Chạy toàn bộ suite trên mọi browser mà không cân nhắc chi phí thời gian**: với suite lớn, đây
  là nguyên nhân phổ biến khiến CI chạy quá lâu — luôn cân nhắc `testMatch` để giới hạn phạm vi.
- **Quên cài Firefox/WebKit trên CI** (chỉ cài Chromium như Chương 19): job CI sẽ fail ngay khi
  chạy tới project firefox/webkit vì thiếu executable — đã cập nhật
  `.github/workflows/playwright.yml` để cài đủ cả 3.
- **Nhầm "giả lập thiết bị di động" với "chạy trên thiết bị thật"**: `devices["Pixel 7"]` giả lập
  viewport/user-agent trên engine Chromium desktop — không phát hiện được lỗi đặc thù của trình
  duyệt di động thật (Chrome for Android) hay hệ điều hành di động thật.

## Tóm tắt & tiếp theo

- `projects` trong `playwright.config.ts` cho phép chạy cùng bộ test trên nhiều browser/thiết bị.
- `testMatch` giới hạn project nào chạy file nào — tránh chạy toàn bộ suite trên mọi browser một
  cách không cần thiết.
- `isMobile` cho phép viết logic riêng cho mobile trong cùng một test, dùng chung cho mọi thiết bị.

Chương 25 học component testing — kiểm thử một component UI độc lập, không cần chạy cả trang, phù
hợp với các dự án dùng framework component (React/Vue/Svelte).
