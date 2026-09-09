# Chương 8: Khởi tạo project Playwright, cấu trúc thư mục project

## Mục tiêu học

- Khởi tạo được một project Playwright mới từ đầu.
- Giải thích được vai trò của từng file mà quá trình khởi tạo sinh ra.
- Chạy được test đầu tiên và đọc hiểu output.

> Code mẫu: `code/playwright-tests/` — project Playwright **thật, chạy được ngay bây giờ**, sẽ
> được xây dần qua toàn bộ Phần IV–VI của sách (đọc `README.md` trong đó để hiểu vì sao đây là
> MỘT project chung, không tách riêng theo từng chương như Phần I–II).

## 8.1. Khởi tạo project

Cách nhanh nhất để bắt đầu một project Playwright mới:

```bash
npm init playwright@latest
```

Lệnh này hỏi vài câu (TypeScript hay JavaScript, thư mục test tên gì, có thêm GitHub Actions
workflow không, có cài luôn browser không) rồi tự cài `@playwright/test` và sinh ra cấu trúc project.
`code/playwright-tests/` trong repo đã được dựng sẵn tương đương với lựa chọn: **TypeScript**, thư
mục test tên `tests/`, cài Chromium.

Nếu muốn tự làm từng bước (thay vì dùng wizard), tương đương với:

```bash
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

## 8.2. Giải phẫu cấu trúc project

```
playwright-tests/
├── package.json           # khai báo dependency (@playwright/test) + npm scripts
├── playwright.config.ts   # cấu hình trung tâm: thư mục test, browser nào, retry, reporter...
├── tests/                 # nơi chứa các file test (*.spec.ts)
│   └── ch08-smoke.spec.ts
├── .gitignore             # loại report/kết quả test tự sinh ra khỏi git
├── .editorconfig          # thống nhất style editor (đã học ở Chương 7)
└── .prettierrc            # cấu hình format code (đã học ở Chương 7)
```

### `playwright.config.ts` — trung tâm điều khiển

```ts
export default defineConfig({
  testDir: "./tests",          // Playwright tìm file test.spec.ts trong thư mục này
  fullyParallel: true,         // các file test chạy song song để nhanh hơn
  forbidOnly: !!process.env.CI,// chặn commit sót lại test.only() khi chạy trên CI
  retries: process.env.CI ? 2 : 0, // tự chạy lại test fail 2 lần trên CI (giảm ảnh hưởng flaky)
  reporter: "html",            // sinh báo cáo HTML sau khi chạy — xem Chương 18

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

Mỗi dòng cấu hình ở trên sẽ được giải thích sâu hơn khi tới chương liên quan (retry và CI ở Chương
19, reporter ở Chương 18, nhiều `projects` cho cross-browser ở Chương 24). Ở Chương 8, chỉ cần
hiểu: **file này là nơi tập trung mọi cấu hình chạy test**, thay vì rải trong từng file test.

### `tests/` — nơi viết test

Playwright Test tự động tìm mọi file khớp pattern `*.spec.ts` (hoặc `.test.ts`) trong `testDir` và
chạy chúng — không cần khai báo thủ công file nào cần chạy.

## 8.3. Chạy test đầu tiên

```bash
cd code/playwright-tests
npm test
```

Output mong đợi:

```
Running 1 test using 1 worker

  1 passed (21.9s)
```

Nội dung `tests/ch08-smoke.spec.ts` — test đơn giản nhất có thể, chỉ để xác nhận cài đặt thành
công, chưa dùng tới demo app (sẽ có ở Chương 9):

```ts
import { test, expect } from "@playwright/test";

test("Playwright đã cài đặt và chạy được", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);
});
```

Xem báo cáo HTML chi tiết (ảnh chụp, timeline...) bằng:

```bash
npm run report
```

## Bài tập

1. Chạy `npm test` trong `code/playwright-tests/`, xác nhận thấy `1 passed`.
2. Chạy `npm run test:headed` — quan sát trình duyệt Chromium mở lên thật và chạy test.
3. Chạy `npm run report`, mở báo cáo HTML, tìm phần hiển thị thời gian chạy của test.
4. Mở `playwright.config.ts`, thử đổi `testDir` thành `"./tests-khac"` (thư mục không tồn tại),
   chạy lại `npm test` — quan sát thông báo lỗi, rồi đổi lại như cũ.

## Lỗi thường gặp

- **Chạy `npx playwright test` từ sai thư mục**: Playwright Test tìm `playwright.config.ts` ở thư
  mục hiện tại — phải `cd` vào đúng `code/playwright-tests/` trước khi chạy.
- **Quên chạy `npx playwright install`**: `npm install` chỉ cài package Node.js
  (`@playwright/test`), **không tự động cài browser** — thiếu bước này sẽ báo lỗi "Executable
  doesn't exist" khi chạy test.
- **Nhầm `test.only()` còn sót lại trong code**: khiến Playwright chỉ chạy đúng 1 test đó, bỏ qua
  toàn bộ test khác mà không có lỗi nào — đây là lý do `forbidOnly: !!process.env.CI` được đặt sẵn
  trong config để chặn việc này lọt lên CI.

## Tóm tắt & tiếp theo

- `npm init playwright@latest` (hoặc cài thủ công `@playwright/test` + browser) khởi tạo project.
- `playwright.config.ts` là trung tâm cấu hình; `tests/*.spec.ts` là nơi viết test.
- `code/playwright-tests/` trong repo là project **thật, sẽ dùng xuyên suốt** đến hết sách.

Chương 9 xây dựng demo app — mục tiêu để các test từ Chương 10 trở đi có một ứng dụng thật để
nhằm vào, thay vì phải test một trang web bên ngoài như `ch08-smoke.spec.ts` vừa làm.
