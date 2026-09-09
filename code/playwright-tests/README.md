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

## Vì sao một project chung, không phải mỗi chương một project riêng?

Từ Chương 9 trở đi, tất cả test đều nhằm vào **cùng một demo app**, và các kỹ thuật học được ở
chương trước (Page Object Model — Chương 15, fixtures — Chương 16...) được **tái sử dụng và mở
rộng** ở chương sau — đúng với cách một project Playwright thật vận hành trong công việc thực tế.
Tách mỗi chương thành một project riêng sẽ buộc phải copy lại `playwright.config.ts` và các page
object nhiều lần, không phản ánh đúng thực tế.
