# component-testing — Ví dụ Chương 25

Project **riêng biệt**, độc lập với `../demo-app/` và `../playwright-tests/` — vì component
testing (`@playwright/experimental-ct-react`) dùng Vite để build và render THẲNG một component
React trong trình duyệt, không cần server backend nào cả.

## Cài đặt & chạy

```bash
npm install
npx playwright install chromium
npm test
```

## Nội dung

- `src/PasswordField.tsx` — component React tái hiện hành vi hiện/ẩn mật khẩu của
  `code/demo-app/public/login.js` (Chương 9), viết lại dưới dạng component tái sử dụng được.
- `tests/PasswordField.spec.tsx` — 2 test dùng `mount()` để render component trực tiếp, không qua
  trang nào, không cần demo-app chạy.
- `playwright-ct.config.ts`, `playwright/index.html`, `playwright/index.tsx` — cấu hình bắt buộc
  của `@playwright/experimental-ct-react` (xem Chương 25 để hiểu vai trò từng file).
