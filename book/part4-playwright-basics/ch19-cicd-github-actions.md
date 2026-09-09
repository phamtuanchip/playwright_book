# Chương 19: CI/CD — chạy Playwright trên GitHub Actions

## Mục tiêu học

- Hiểu vì sao automation test cần chạy tự động trên CI, không chỉ trên máy cá nhân.
- Viết được một workflow GitHub Actions hoàn chỉnh, chạy đúng 31 test đã có.
- Biết cách lưu lại báo cáo HTML làm artifact để xem sau khi CI chạy xong.

> Code mẫu: `.github/workflows/playwright.yml` — workflow thật, đã kiểm chứng từng bước chạy đúng
> cục bộ (`npm ci` sạch từ lockfile, `npm test` pass 31/31) trước khi đưa vào CI.

## 19.1. Vì sao cần CI, không chỉ chạy trên máy cá nhân?

Nhắc lại Chương 1 (SDLC) và Chương 2 (Regression testing): giá trị lớn nhất của automation test là
**chạy lại liên tục, tự động**, mỗi khi có code mới — không phải chạy một lần rồi thôi. Nếu test
chỉ chạy khi ai đó nhớ chạy tay trên máy mình, giá trị đó gần như mất hết: một PR có thể merge dù
làm hỏng tính năng khác, chỉ vì không ai chạy lại test trước khi merge.

**CI (Continuous Integration)** giải quyết đúng vấn đề này: mỗi khi có commit/PR mới, một máy chủ
(không phải máy cá nhân) tự động clone code, cài đặt, và chạy toàn bộ test suite — kết quả hiển
thị ngay trên PR, không ai có thể "quên chạy test" nữa.

## 19.2. Workflow GitHub Actions hoàn chỉnh

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install demo-app dependencies
        working-directory: code/demo-app
        run: npm ci

      - name: Install playwright-tests dependencies
        working-directory: code/playwright-tests
        run: npm ci

      - name: Install Playwright browsers (Chromium only)
        working-directory: code/playwright-tests
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        working-directory: code/playwright-tests
        run: npm test

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: code/playwright-tests/playwright-report/
          retention-days: 7
```

Đi qua từng phần:

- **`on:`** — chạy khi có push hoặc pull request vào nhánh `main`. Đây là cấu hình phổ biến nhất:
  test chạy trên mọi PR **trước khi** merge, không phải sau.
- **Hai bước `npm ci` riêng biệt** — vì project có 2 package.json độc lập (`demo-app` và
  `playwright-tests`, nhắc lại quyết định kiến trúc ở Chương 9). `npm ci` (khác `npm install`) cài
  **chính xác** phiên bản trong `package-lock.json`, không tự nâng cấp gì — đảm bảo CI dùng đúng
  phiên bản đã test trên máy dev.
- **`npx playwright install --with-deps chromium`** — cờ `--with-deps` tự cài thêm các thư viện hệ
  thống Linux mà Chromium cần (không có sẵn trên máy ảo CI trần) — cờ này chỉ cần trên Linux, không
  cần trên máy Windows/macOS cá nhân.
- **`if: always()`** ở bước upload — chạy dù bước trước đó pass hay fail, để **luôn** có báo cáo
  tải về xem, đặc biệt quan trọng khi test fail.

## 19.3. `webServer` hoạt động thế nào trên CI?

Nhắc lại Chương 9: `playwright.config.ts` có cấu hình `webServer` tự khởi động `demo-app`. Trên CI,
`reuseExistingServer: !process.env.CI` sẽ là `false` (vì GitHub Actions tự đặt biến môi trường
`CI=true`) — nghĩa là Playwright **luôn tự khởi động** demo app mới trên CI, không bao giờ giả định
đã có sẵn server chạy từ trước (khác lúc dev cục bộ, có thể đang chạy `npm start` sẵn ở terminal
khác).

## 19.4. `forbidOnly` và `retries` — hai cấu hình chỉ có ý nghĩa trên CI

```ts
// playwright.config.ts — đã có từ Chương 9
forbidOnly: !!process.env.CI, // chặn merge nếu code còn sót test.only()
retries: process.env.CI ? 2 : 0, // tự chạy lại 2 lần nếu fail — giảm ảnh hưởng flaky test
```

- `forbidOnly`: nếu ai lỡ để `test.only(...)` trong code (chỉ chạy 1 test, bỏ qua test khác) và
  commit nhầm, CI sẽ **fail ngay** thay vì âm thầm bỏ qua toàn bộ test khác — bắt lỗi này trước khi
  merge.
- `retries`: chỉ bật trên CI, không bật khi dev cục bộ — vì lúc dev, bạn **muốn** thấy fail ngay để
  sửa, không muốn chờ retry 2 lần mới báo lỗi.

## Bài tập

1. Đọc lại `.github/workflows/playwright.yml`, xác định: nếu bước "Run Playwright tests" fail, các
   bước sau nó có chạy tiếp không? Vì sao bước "Upload HTML report" vẫn cần chạy trong trường hợp đó?
2. Thử tạo một repository GitHub thật (hoặc dùng chính repo của sách này nếu đã đẩy lên GitHub),
   push code lên, mở tab "Actions" — xác nhận workflow chạy và cho kết quả 31 test pass.
3. Cố tình gây fail một test (ví dụ sửa sai một assertion), push lên, quan sát: workflow có báo
   fail đúng không, và artifact `playwright-report` có tải về xem được không?
4. Thêm một step mới vào workflow, chạy `npm run allure:generate` (Chương 18) — cần thêm bước cài
   Java trước đó (gợi ý: tìm action `actions/setup-java` trên GitHub Marketplace).

## Lỗi thường gặp

- **Quên `npm ci` riêng cho cả `demo-app` VÀ `playwright-tests`**: chỉ cài một trong hai sẽ khiến
  `webServer` không khởi động được (thiếu `node_modules` của `demo-app`) — lỗi timeout khó hiểu nếu
  không biết nguyên nhân.
- **Dùng `npm install` thay vì `npm ci` trên CI**: có thể cài phiên bản khác với máy dev do
  `package-lock.json` không được tôn trọng chặt như `npm ci`, gây lỗi "chạy được trên máy tôi
  nhưng fail trên CI".
- **Không đặt `timeout-minutes`**: nếu `webServer` treo vì lý do nào đó, job có thể chạy vô thời
  hạn (tới giới hạn mặc định của GitHub, thường 6 giờ) — luôn đặt timeout hợp lý.

## Tóm tắt & tiếp theo

- CI/CD đảm bảo automation test chạy tự động mỗi khi có code mới, không phụ thuộc việc ai đó nhớ
  chạy tay.
- Workflow GitHub Actions cho project 2 package.json cần `npm ci` riêng cho từng thư mục.
- `forbidOnly` và `retries` là hai cấu hình đặc biệt cho môi trường CI, khác với chạy cục bộ.

Phần IV (Playwright cơ bản) đến đây đã hoàn thành — 19 chương, 31 test, một demo app đầy đủ tính
năng, một pipeline CI thật. Phần V bắt đầu các kỹ thuật nâng cao: API testing, visual testing,
authentication/storage state, chạy song song, cross-browser, và component testing.
