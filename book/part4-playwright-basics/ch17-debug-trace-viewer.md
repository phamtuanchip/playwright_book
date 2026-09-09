# Chương 17: Debug — Trace Viewer, UI Mode, `--debug`, codegen

## Mục tiêu học

- Xem lại từng bước một test đã chạy bằng Trace Viewer, kể cả sau khi test đã chạy xong.
- Dùng UI Mode để chạy và debug test tương tác trong lúc viết.
- Dùng `--debug` để dừng lại từng bước, và `codegen` để sinh code test bằng cách thao tác tay.

Chương này không thêm test mới — tận dụng lại 31 test đã có ở `code/playwright-tests/` (đặc biệt
hai lần fail thật ở Chương 11 và Chương 14) để minh hoạ cách debug đúng.

## 17.1. Trace Viewer — "hộp đen" ghi lại mọi thứ đã xảy ra

**Trace** là một bản ghi đầy đủ những gì xảy ra trong lúc chạy test: từng action, ảnh chụp màn hình
trước/sau mỗi bước, network request, console log — đủ để xem lại **sau khi test đã chạy xong**, kể
cả trên máy khác (ví dụ tải trace từ CI về xem ở máy local).

```bash
npm run test:trace   # chạy toàn bộ test, ép ghi trace cho MỌI test (mặc định chỉ ghi khi retry)
npm run show-trace test-results/<tên-thư-mục-test>/trace.zip
```

Mở trace lên, bạn thấy:

- **Timeline** các action theo thứ tự, click vào từng action thấy ảnh chụp màn hình đúng lúc đó.
- **Tab Network** — mọi request/response, đúng thứ tự — hữu ích để debug các tình huống như Chương
  14 (kiểm tra request thật gửi đi có đúng dữ liệu không).
- **Tab Console** — log JavaScript phía trình duyệt (ví dụ nếu `public/login.js` có `console.log`).
- **Tab Source** — dòng code test tương ứng với action đang xem.

### Cấu hình mức ghi trace

```ts
// playwright.config.ts (đã có từ Chương 9)
use: {
  trace: "on-first-retry", // chỉ ghi trace khi 1 test fail và được retry lần đầu
},
```

| Giá trị | Khi nào ghi trace | Phù hợp cho |
|---|---|---|
| `"off"` | Không bao giờ | Không khuyến nghị |
| `"on-first-retry"` | Chỉ khi test fail và retry (mặc định của sách) | Chạy hàng ngày/CI — tiết kiệm dung lượng, vẫn có trace khi cần |
| `"retain-on-failure"` | Mọi test fail (không cần retry) | Debug cục bộ khi chưa cấu hình retry |
| `"on"` | MỌI test, pass hay fail | Chỉ dùng tạm để học/debug sâu — tốn dung lượng đáng kể |

## 17.2. Ứng dụng thực tế: đọc lại 2 lần fail thật đã gặp

Nếu bạn đã làm theo bài tập ở Chương 11 (tạm bỏ `workers: 1`) hoặc Chương 14 (tạm bỏ `try/catch`
trong `login.js`), bạn đã tự tạo ra 2 lần fail thật. Với trace của một lần fail như vậy, quy trình
debug chuẩn là:

1. Mở tab **Network** trước — với lỗi ở Chương 14 (500 error), bạn sẽ thấy ngay request
   `/api/login` trả về status `500`, body không phải JSON — xác nhận đúng giả thuyết ban đầu.
2. Xem **action ngay trước khi fail** trong timeline — với lỗi ở Chương 11 (TC-07 flaky do race
   condition), bạn sẽ thấy bước `expect().toBeVisible()` timeout vì phần tử không tồn tại — nhưng
   trace của MỘT test đơn lẻ sẽ không tự lộ ra nguyên nhân (test khác chạy song song can thiệp) —
   đây là lúc kỹ năng suy luận từ Chương 6 (hiểu hệ thống) quan trọng hơn công cụ.
3. Đọc **Console tab** — nếu code frontend có lỗi JS không bắt được (như lỗi gốc ở Chương 14),
   thường sẽ thấy "Uncaught (in promise) SyntaxError..." ở đây — dấu hiệu trực tiếp dẫn tới nguyên
   nhân.

## 17.3. UI Mode — chạy và debug tương tác trong lúc viết

```bash
npm run test:ui
```

UI Mode mở một giao diện riêng: danh sách test bên trái, chạy từng test hoặc cả file, xem trace
**ngay lập tức** không cần chờ tạo file `.zip` riêng, và có nút "pick locator" để click vào một
phần tử trên trang và lấy ngay locator Playwright khuyến nghị cho nó — đặc biệt hữu ích khi đang
viết test mới, không phải khi debug test cũ đã fail.

## 17.4. `--debug` — dừng lại từng bước

```bash
npm run test:debug -- ch11-login-test-cases
```

Chạy với `--debug` mở **Playwright Inspector**: test dừng lại **trước mỗi action**, cho phép bạn
bấm "Step over" để chạy tiếp từng bước một, hoặc gõ lệnh Playwright trực tiếp vào ô lệnh để thử
locator ngay trên trang đang mở. Khác UI Mode (thiết kế để chạy nhanh nhiều test), `--debug` phù
hợp khi cần hiểu **chính xác** vì sao một bước cụ thể không hoạt động như mong đợi.

## 17.5. `codegen` — sinh code bằng cách thao tác tay

```bash
npx playwright codegen http://localhost:3000/login
```

Lệnh này mở một trình duyệt thật, kèm cửa sổ Playwright Inspector — mọi cú click, gõ chữ của bạn
trên trang được **tự động chuyển thành code Playwright**, hiện ra ở cửa sổ inspector. Ví dụ, click
vào email, gõ `demo@example.com`, click vào password, gõ mật khẩu, click nút đăng nhập, `codegen`
sẽ sinh ra gần đúng:

```ts
await page.getByLabel('Email').click();
await page.getByLabel('Email').fill('demo@example.com');
await page.getByLabel('Mật khẩu').click();
await page.getByLabel('Mật khẩu').fill('Password123!');
await page.getByRole('button', { name: 'Đăng nhập' }).click();
```

**Quan trọng:** code sinh ra bởi `codegen` là **điểm khởi đầu tốt, không phải sản phẩm cuối**.
So với code thật trong `ch11-login-test-cases.spec.ts`, code trên thiếu: cấu trúc test có tên rõ
nghĩa (TC-01...), thiếu assertion (`codegen` không tự biết bạn muốn kiểm tra gì), và có thể có
những dòng thừa (như `.click()` trước `.fill()` — không cần thiết vì `fill()` đã tự focus vào
input). Luôn **đọc lại và tinh gọn** code từ `codegen`, áp dụng các nguyên tắc đã học ở Chương 6 và
11, trước khi coi nó là test hoàn chỉnh.

## Bài tập

1. Chạy `npm run test:trace` trong `code/playwright-tests/`, sau đó `npm run show-trace` với một
   file `trace.zip` bất kỳ trong `test-results/` — xem qua Timeline, Network, Console.
2. Chạy `npm run test:ui`, thử dùng nút "pick locator" trên trang `/profile` — so sánh locator nó
   gợi ý với locator đã viết tay trong `pages/ProfilePage.ts`.
3. Chạy `npm run test:debug -- ch13-form-input-upload`, dùng "Step over" đi qua từng bước của test
   "upload ảnh đại diện" — quan sát ảnh trong `#avatar-filename` thay đổi ra sao qua từng bước.
4. Chạy `npx playwright codegen http://localhost:3000/login` (yêu cầu demo app đang chạy —
   `cd code/demo-app && npm start` ở terminal khác), thử đăng nhập tay, so sánh code sinh ra với
   `pages/LoginPage.ts`.

## Lỗi thường gặp

- **Đặt `trace: "on"` cho chạy CI hàng ngày**: sinh ra dung lượng trace khổng lồ cho hàng trăm test
  pass — chỉ nên dùng tạm thời khi cần debug sâu, không để mặc định lâu dài.
- **Coi code từ `codegen` là sản phẩm cuối, không tinh gọn lại**: dẫn đến test khó đọc, thiếu
  assertion có ý nghĩa, hoặc dùng locator không tối ưu (xem mục 17.5).
- **Debug bằng cách đọc code trước, xem trace sau**: nên làm ngược lại — xem trace (đặc biệt tab
  Network và Console) để có giả thuyết trước, rồi mới quay lại đọc code để xác nhận.

## Tóm tắt & tiếp theo

- Trace Viewer ghi lại đầy đủ diễn biến một lần chạy test, xem lại được sau khi test đã chạy xong.
- UI Mode phù hợp khi đang viết/chạy nhiều test; `--debug` phù hợp khi cần dừng lại từng bước.
- `codegen` sinh code nhanh bằng thao tác tay, nhưng luôn cần tinh gọn lại theo các nguyên tắc đã
  học (Chương 6, 11) trước khi dùng thật.

Chương 18 học cách trình bày kết quả test — reporter HTML đã dùng ngầm định từ đầu, và cách tích
hợp Allure để có báo cáo chi tiết hơn, phù hợp chia sẻ với cả người không đọc code.
