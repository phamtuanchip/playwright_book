# playwright-tests — Bộ test dùng xuyên suốt Phần IV–VI

Đây **không phải** code mẫu riêng của một chương — đây là **một project Playwright thật, duy
nhất**, được xây dần qua các chương (Chương 8 trở đi), chạy test nhằm vào `../demo-app/` (giới
thiệu ở Chương 9). Mỗi chương thêm file test mới vào `tests/`, đặt tên `chXX-*.spec.ts` để bạn biết
file nào tương ứng chương nào.

## Cài đặt (một lần)

```bash
npm install
npx playwright install chromium
```

## Chạy test

```bash
npm test              # chạy toàn bộ test, chế độ headless
npm run test:headed   # chạy có hiển thị trình duyệt
npm run test:ui       # mở Playwright UI Mode (Chương 17)
npm run report        # xem báo cáo HTML sau khi chạy
```

## File nào ứng với chương nào

| File | Chương |
|---|---|
| `tests/ch08-smoke.spec.ts` | 8 — khởi tạo project, xác nhận cài đặt |
| `tests/ch09-demo-app-smoke.spec.ts` | 9 — giới thiệu demo app |
| `tests/ch11-login-test-cases.spec.ts` | 11 — tự động hoá đầy đủ TC-01→TC-10 (Chương 1) bằng locators/actions/assertions |
| `tests/ch12-cau-truc-test.spec.ts` | 12 — `test.describe`, 4 loại hook, `test.step` |

## Vì sao một project chung, không phải mỗi chương một project riêng?

Từ Chương 9 trở đi, tất cả test đều nhằm vào **cùng một demo app**, và các kỹ thuật học được ở
chương trước (Page Object Model — Chương 15, fixtures — Chương 16...) được **tái sử dụng và mở
rộng** ở chương sau — đúng với cách một project Playwright thật vận hành trong công việc thực tế.
Tách mỗi chương thành một project riêng sẽ buộc phải copy lại `playwright.config.ts` và các page
object nhiều lần, không phản ánh đúng thực tế.

## Ghi chú: vì sao `workers: 1` (chạy tuần tự) từ Chương 11?

Nhiều test dùng chung một tài khoản (`demo@example.com`) trên một server demo app — chạy song song
gây đụng độ trạng thái (ví dụ TC-07 đang đếm số lần đăng nhập sai thì bị test khác reset xen vào).
Xem giải thích đầy đủ ở Chương 11, mục 11.5. Chương 23 sẽ giải quyết đúng cách để bật lại song song.
