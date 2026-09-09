# Chương 21: Visual testing / so sánh screenshot

## Mục tiêu học

- Viết được visual test bằng `toHaveScreenshot()`, hiểu cơ chế so sánh ảnh baseline.
- Hiểu và xử lý đúng vấn đề cố hữu: ảnh chụp màn hình phụ thuộc hệ điều hành.
- Biết khi nào visual testing đáng giá, khi nào assertion văn bản (Chương 11) đã đủ.

> Code mẫu: `code/playwright-tests/tests/ch21-visual-testing.spec.ts` — kèm minh chứng THẬT: một
> lần cố tình đổi màu nút bấm, visual test bắt được ngay, phát hiện đúng "5% pixel khác biệt".

## 21.1. Vì sao cần visual testing, khi đã có assertion văn bản?

Toàn bộ test từ Chương 11 tới giờ kiểm tra **nội dung/hành vi** (text, URL, thuộc tính) — không
kiểm tra **hình thức hiển thị**. Một CSS lỗi làm nút bấm bị đổi màu, lệch vị trí, hoặc chữ bị chồng
lên nhau vẫn có thể **pass toàn bộ** test hiện có, vì nội dung text/URL không đổi. Visual testing
lấp đúng lỗ hổng này: so sánh **ảnh chụp màn hình thật** với một ảnh "baseline" đã lưu trước.

## 21.2. `toHaveScreenshot()` — cơ bản

```ts
test("giao diện trang đăng nhập không đổi ngoài ý muốn", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveScreenshot("login-page.png");
});
```

Lần chạy **đầu tiên**, Playwright chưa có ảnh để so sánh — cần tạo baseline:

```bash
npx playwright test ch21-visual-testing --update-snapshots
```

Ảnh được lưu vào `tests/ch21-visual-testing.spec.ts-snapshots/login-page-chromium-win32.png` — chú
ý tên file có hậu tố **`-chromium-win32`**: Playwright tự đặt tên theo browser + hệ điều hành, vì
(mục 21.4) ảnh render khác nhau giữa các hệ điều hành.

Có thể so sánh **cả trang** (`expect(page)`) hoặc **một phần tử cụ thể** (`expect(locator)`) — nên
ưu tiên so sánh phần tử cụ thể khi có thể, để giảm nhiễu từ những phần không liên quan đang thay
đổi (ví dụ đồng hồ, banner quảng cáo động).

## 21.3. Minh chứng thật: visual test bắt được thay đổi CSS

Để kiểm chứng cơ chế này thực sự hoạt động (không chỉ tin theo tài liệu), khi viết chương này, một
dòng CSS được cố tình thêm vào tạm thời:

```css
/* code/demo-app/public/style.css — thêm tạm để kiểm chứng, đã revert ngay sau đó */
button[type="submit"] {
  /* ... */
  background: #ff00ff;
}
```

Chạy lại test, kết quả:

```
3852 pixels (ratio 0.05 of all image pixels) are different.
```

Playwright báo **chính xác tỉ lệ pixel khác biệt** (5%) và đính kèm 2 ảnh: `*-actual.png` (ảnh
thật vừa chụp) và `*-diff.png` (ảnh highlight vùng khác biệt màu đỏ) — đủ để xác định ngay đây là
thay đổi cố ý hay bug thật, mà không cần đoán.

## 21.4. Vấn đề cố hữu: ảnh chụp màn hình phụ thuộc hệ điều hành

Đây là điều **quan trọng nhất** cần hiểu trước khi dùng visual testing trong CI thật: cùng một
trang, Chrome trên Windows và Chrome trên Linux (như CI ở Chương 19, chạy `ubuntu-latest`) sẽ cho
ra ảnh chụp **khác nhau ở mức pixel** — do font rendering, anti-aliasing khác nhau giữa hệ điều
hành, dù giao diện "nhìn giống nhau bằng mắt người".

Baseline `login-page-chromium-win32.png` tạo trên Windows (máy viết sách này) **sẽ không khớp**
nếu chạy trên `ubuntu-latest`. Đây không phải bug của Playwright hay của sách — đây là hạn chế cố
hữu của kỹ thuật visual testing khi dev và CI dùng hệ điều hành khác nhau.

**Giải pháp đã áp dụng trong sách (tạm thời, minh bạch):**

```ts
test.describe("Visual testing (chỉ chạy local — xem lý do trong Chương 21)", () => {
  test.skip(
    !!process.env.CI,
    "Baseline ảnh được tạo trên Windows, không khớp ubuntu-latest trên CI (khác OS)"
  );
  // ...
});
```

**Giải pháp đúng trong thực tế** (không áp dụng trong sách vì cần Docker, ngoài phạm vi môi trường
viết sách): tạo baseline bằng **Docker image chính thức của Playwright**
(`mcr.microsoft.com/playwright`) — image này dùng đúng phiên bản OS/browser mà CI Linux sẽ dùng,
đảm bảo baseline luôn khớp bất kể máy dev chạy Windows/macOS/Linux gì.

## Bài tập

1. Chạy `npx playwright test ch21-visual-testing --update-snapshots` để tự tạo baseline trên máy
   bạn, sau đó chạy lại không có cờ đó — xác nhận pass.
2. Tự tái hiện thí nghiệm ở mục 21.3: đổi một giá trị CSS trong `code/demo-app/public/style.css`,
   chạy lại test, xem ảnh `*-diff.png` trong `test-results/`. Nhớ revert lại sau khi xem xong.
3. Đổi `maxDiffPixelRatio: 0.1` vào tham số thứ hai của `toHaveScreenshot()` (cho phép sai khác tới
   10%) — thử lại thí nghiệm ở bài 2, xem ngưỡng nào bắt được, ngưỡng nào bỏ qua thay đổi đó.
4. Đọc tài liệu Playwright về Docker image chính thức — viết ra (không cần chạy) các bước bạn sẽ
   làm để tạo baseline nhất quán với CI Linux nếu máy bạn có Docker.

## Lỗi thường gặp

- **Tạo baseline trên máy dev (Windows/macOS), dùng thẳng cho CI Linux**: gây fail giả 100% các
  lần chạy CI — đây là lỗi rất phổ biến khi mới áp dụng visual testing, xem mục 21.4.
- **So sánh toàn trang cho mọi test**: dễ bị nhiễu bởi phần không liên quan đang thay đổi (ngày
  giờ, dữ liệu động) — ưu tiên so sánh phần tử cụ thể.
- **Không đặt ngưỡng sai khác hợp lý**: mặc định rất chặt (gần như 0% sai khác), có thể fail chỉ vì
  khác biệt sub-pixel không đáng kể — cân nhắc `maxDiffPixelRatio` cho các trường hợp phù hợp,
  nhưng không đặt quá cao khiến test mất tác dụng phát hiện lỗi thật.

## Tóm tắt & tiếp theo

- `toHaveScreenshot()` phát hiện thay đổi UI mà assertion văn bản không thấy được — đã kiểm chứng
  thật bằng cách cố tình đổi CSS.
- Ảnh chụp màn hình phụ thuộc hệ điều hành — baseline tạo trên Windows không dùng được cho CI
  Linux; giải pháp thực tế là dùng Docker image chính thức của Playwright.
- Sách tạm `test.skip` nhóm test này trên CI, minh bạch ghi rõ lý do — một quyết định kỹ thuật thật,
  không phải giấu đi hạn chế.

Chương 22 học kỹ thuật storage state — lưu trạng thái đăng nhập ra file để tái sử dụng giữa nhiều
lần chạy test, đi xa hơn kỹ thuật "đăng nhập qua API" đã học ở Chương 20.
