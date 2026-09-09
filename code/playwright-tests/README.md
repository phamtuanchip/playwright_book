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
| `tests/ch13-form-input-upload.spec.ts` | 13 — text/textarea/select/checkbox/upload file (trang `/profile`) |
| `tests/ch14-auto-waiting-network.spec.ts` | 14 — auto-waiting với mạng chậm, `waitForResponse`, giả lập lỗi server bằng `page.route` |
| `pages/LoginPage.ts`, `pages/ProfilePage.ts` + `tests/ch15-page-object-model.spec.ts` | 15 — Page Object Model, viết lại TC-01/TC-02 qua POM |
| `fixtures.ts` + `tests/ch16-fixtures-co-ban.spec.ts` | 16 — custom fixture `loggedInPage` (setup + teardown quanh `use()`) |
| `tests/ch20-api-testing.spec.ts` | 20 — API test thuần qua `request`, và kỹ thuật `page.request` để đăng nhập nhanh trước khi test UI |
| `tests/ch21-visual-testing.spec.ts` | 21 — `toHaveScreenshot()`; bị `test.skip` trên CI vì baseline tạo trên Windows (xem README này, mục dưới) |
| `global-setup.ts` + `tests/ch22-auth-storage-state.spec.ts` | 22 — storage state (`storageState.json`) + endpoint seed `/api/test/seed-failed-attempts` cho TC-07 |

## Vì sao một project chung, không phải mỗi chương một project riêng?

Từ Chương 9 trở đi, tất cả test đều nhằm vào **cùng một demo app**, và các kỹ thuật học được ở
chương trước (Page Object Model — Chương 15, fixtures — Chương 16...) được **tái sử dụng và mở
rộng** ở chương sau — đúng với cách một project Playwright thật vận hành trong công việc thực tế.
Tách mỗi chương thành một project riêng sẽ buộc phải copy lại `playwright.config.ts` và các page
object nhiều lần, không phản ánh đúng thực tế.

## Ghi chú: vì sao test visual (Chương 21) bị bỏ qua trên CI?

Ảnh baseline trong `tests/ch21-visual-testing.spec.ts-snapshots/` được tạo trên máy Windows viết
sách này — tên file có hậu tố `-win32`. CI (`.github/workflows/playwright.yml`, Chương 19) chạy
trên `ubuntu-latest` — ảnh chụp màn hình render khác nhau giữa hệ điều hành (font, anti-aliasing),
nên baseline Windows sẽ luôn không khớp trên Linux. `ch21-visual-testing.spec.ts` tự `test.skip`
khi `process.env.CI` được đặt, để không làm CI đỏ giả. Cách khắc phục đúng trong thực tế: tạo
baseline bằng Docker image chính thức của Playwright (cùng OS với CI), không tạo trên máy dev.

## Ghi chú: vì sao `workers: 1` (chạy tuần tự) từ Chương 11?

Nhiều test dùng chung một tài khoản (`demo@example.com`) trên một server demo app — chạy song song
gây đụng độ trạng thái (ví dụ TC-07 đang đếm số lần đăng nhập sai thì bị test khác reset xen vào).
Xem giải thích đầy đủ ở Chương 11, mục 11.5. Chương 23 sẽ giải quyết đúng cách để bật lại song song.
