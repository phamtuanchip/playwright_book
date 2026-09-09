# Chương 11: Test đầu tiên — Locators, Actions, Assertions

## Mục tiêu học

- Chọn được locator ổn định, đúng tinh thần Playwright khuyến nghị.
- Sử dụng thành thạo các action phổ biến: `fill`, `click`, `press`.
- Viết assertion đúng, tận dụng auto-waiting của `expect()`.
- Tự động hoá hoàn chỉnh một bộ test case thật, từ Chương 1 tới code chạy được.

> Code mẫu: `code/playwright-tests/tests/ch11-login-test-cases.spec.ts` — tự động hoá **toàn bộ
> 10 test case** ở `code/ch01-sdlc/test-case-list-login.md`, chạy được ngay bây giờ.

## 11.1. Locator — chọn phần tử để thao tác

**Locator** đại diện cho cách tìm một phần tử trên trang. Playwright khuyến nghị mạnh mẽ: ưu tiên
locator theo **thuộc tính người dùng nhìn thấy/thao tác được** (role, label, text) thay vì cấu trúc
DOM nội bộ (class CSS, thứ tự phần tử) — đây chính là bài học từ Vấn đề 2 ở Chương 6.

| Locator | Dùng khi nào | Ví dụ |
|---|---|---|
| `getByRole()` | Ưu tiên hàng đầu — theo vai trò ARIA (button, textbox, link...) | `getByRole("button", { name: "Đăng nhập" })` |
| `getByLabel()` | Cho input có `<label>` liên kết | `getByLabel("Email")` |
| `getByText()` | Tìm theo nội dung text hiển thị | `getByText("Email hoặc mật khẩu không đúng")` |
| `getByTestId()` | Khi không có role/label/text ổn định — cần thêm `data-testid` vào HTML | `getByTestId("cart-total")` |
| `locator("selector")` | CSS/XPath thô — **chỉ dùng khi không còn lựa chọn nào ở trên** | `locator("#username")` |

Trong `ch11-login-test-cases.spec.ts`, gần như mọi thao tác dùng `getByLabel` hoặc `getByRole` —
chỉ có `page.locator("#username")` và `page.locator("#email-error")` dùng CSS selector, vì đó là
các phần tử **hiển thị dữ liệu** (không phải phần tử người dùng thao tác), không có "vai trò" hay
"label" tự nhiên để bám vào — dùng `id` cho trường hợp này là hợp lý.

### Bài học từ Chương 9: locator tưởng ổn định vẫn có thể nhập nhằng

Nhắc lại bug đã gặp ở Chương 9: `getByLabel("Mật khẩu")` từng khớp nhầm cả nút "hiện mật khẩu" vì
`aria-label` của nút chứa chuỗi con trùng với tên label. **Bài học:** dùng locator theo thuộc tính
người dùng thấy tốt hơn CSS selector, nhưng vẫn cần đặt tên (label, aria-label, text) **không trùng
lặp/chồng lấn** giữa các phần tử trên cùng trang.

## 11.2. Action — thao tác trên phần tử

```ts
await page.getByLabel("Email").fill("demo@example.com");       // điền text (xoá nội dung cũ trước)
await page.getByRole("button", { name: "Đăng nhập" }).click(); // click
await page.getByLabel("Mật khẩu").press("Enter");               // gõ 1 phím — TC-09
```

Mọi action ở trên đều có **auto-waiting**: `click()` tự chờ phần tử tồn tại, hiển thị, không bị che
khuất, và không bị `disabled` trước khi thực sự click — không cần `waitForTimeout` như Vấn đề 1 ở
Chương 6.

## 11.3. Assertion — kiểm tra kết quả

`expect()` của Playwright (khác `expect()` của Jest/Node `assert`) **tự động chờ và thử lại** tới
khi điều kiện đúng hoặc hết timeout (mặc định 5 giây) — đây là lý do các test trong sách này hiếm
khi cần `waitForTimeout`.

```ts
await expect(page).toHaveURL("/dashboard");                          // URL trang hiện tại
await expect(page.locator("#username")).toHaveText("demo@example.com"); // nội dung text chính xác
await expect(page.getByText("...")).toBeVisible();                    // phần tử hiển thị
await expect(passwordInput).toHaveAttribute("type", "password");      // giá trị thuộc tính
await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeDisabled(); // bị vô hiệu hoá
```

**Nguyên tắc quan trọng** (nhắc lại Vấn đề 3, Chương 6): assertion phải khớp **chính xác** với "Kết
quả mong đợi" trong test case gốc. Ví dụ TC-01 yêu cầu "Chuyển sang trang `/dashboard`, hiển thị
tên người dùng ở góc phải" → cần **cả hai** assertion (`toHaveURL` **và** `toHaveText`), thiếu một
trong hai là tự động hoá chưa đủ so với test case gốc.

## 11.4. Đọc toàn bộ ví dụ: TC-01 → TC-10

Mở `code/playwright-tests/tests/ch11-login-test-cases.spec.ts` — mỗi test được đặt tên đúng theo ID
test case gốc. Vài điểm đáng chú ý khi đọc:

- **TC-04/05/06** (validation): không có `page.goto()` nào sau khi click — vì validation chặn ở
  phía client (`public/login.js`, Chương 9), test xác nhận `page` **vẫn ở lại** `/login` và nội
  dung lỗi đúng field tương ứng.
- **TC-07** (khoá tài khoản): dùng vòng lặp `for` để mô phỏng "5 lần sai liên tiếp" — một kỹ thuật
  đơn giản để tự động hoá một hành vi lặp lại nhiều bước.
- **TC-08** (hiện/ẩn mật khẩu): assertion kiểm tra **thuộc tính** `type` của input thay đổi từ
  `"password"` sang `"text"`, và giá trị (`toHaveValue`) không đổi qua lần toggle.
- **`test.beforeEach`**: gọi `request.post("/api/test/reset")` trước **mỗi** test — đảm bảo mỗi
  test bắt đầu từ trạng thái sạch (tài khoản demo chưa bị khoá), không phụ thuộc kết quả test chạy
  trước nó (nguyên tắc "test độc lập" — Vấn đề 5, Chương 6).

## 11.5. Một quyết định thật: vì sao `playwright.config.ts` đổi sang `workers: 1`?

Khi mới viết xong 10 test này và chạy song song (`fullyParallel: true`, cấu hình mặc định từ
Chương 9), TC-07 **fail ngẫu nhiên**: đôi khi pass, đôi khi không đủ 5 lần sai để bị khoá. Nguyên
nhân: mọi test dùng chung **một tài khoản** (`demo@example.com`) trên **một server**, nên khi TC-07
đang đếm dở 5 lần sai, một test khác (chạy song song ở worker khác) gọi `/api/test/reset` xen vào
giữa chừng, làm bộ đếm về 0.

Đây **không phải lỗi code test** — đây là hệ quả tự nhiên của việc nhiều test cùng ghi vào một
nguồn dữ liệu chung khi chạy song song. Giải pháp tạm thời (đã áp dụng): đặt `workers: 1` trong
`playwright.config.ts`, chạy tuần tự cho tới khi Chương 23 dạy cách seed dữ liệu riêng cho từng
worker — lúc đó có thể bật lại chạy song song an toàn.

## Bài tập

1. Chạy `npm test` trong `code/playwright-tests/`, xác nhận toàn bộ 14 test (Chương 8, 9, 11) pass.
2. Tạm đổi `workers: 1` thành bỏ dòng đó (dùng mặc định, chạy song song) trong `playwright.config.ts`,
   chạy `npm test` vài lần liên tiếp — quan sát TC-07 có fail ngẫu nhiên như mô tả ở mục 11.5 không.
   Đổi lại `workers: 1` sau khi thử xong.
3. Viết thêm một test case của riêng bạn cho tính năng bạn đã chọn ở bài tập Chương 1, dùng đúng 3
   thành phần: locator (ưu tiên `getByRole`/`getByLabel`), action, assertion khớp chính xác kết quả
   mong đợi.
4. Trong `ch11-login-test-cases.spec.ts`, tìm dòng dùng CSS selector thô (`page.locator("#...")`) —
   giải thích tại sao ở đó không dùng được `getByRole`/`getByLabel`/`getByText`.

## Lỗi thường gặp

- **Dùng `locator()` với CSS selector cho mọi thứ** thay vì `getByRole`/`getByLabel`: hoạt động
  đúng lúc viết, nhưng dễ vỡ khi dev đổi cấu trúc DOM — xem lại Vấn đề 2, Chương 6.
- **Assertion không khớp chính xác "Kết quả mong đợi"**: ví dụ chỉ check `toHaveURL` mà quên check
  nội dung hiển thị — bỏ sót phần quan trọng của test case gốc.
- **Quên `test.beforeEach` reset dữ liệu**: dẫn đến test pass/fail phụ thuộc thứ tự chạy hoặc lần
  chạy trước — đặc biệt nguy hiểm với các test làm thay đổi trạng thái lâu dài như TC-07.
- **Không nhận ra flaky test do trạng thái dùng chung** (mục 11.5): dễ nhầm là "Playwright không ổn
  định" trong khi nguyên nhân thực sự là kiến trúc test/dữ liệu.

## Tóm tắt & tiếp theo

- Locator: ưu tiên `getByRole`/`getByLabel`/`getByText`, chỉ dùng CSS selector khi không còn lựa
  chọn nào tốt hơn.
- Action (`fill`, `click`, `press`) và assertion (`expect()`) đều có auto-waiting sẵn.
- Toàn bộ 10 test case Chương 1 nay đã là automation test thật, chạy được, và đã giúp phát hiện một
  vấn đề thật về kiến trúc test (chạy song song trên dữ liệu dùng chung).

Chương 12 đi sâu hơn vào cách **tổ chức** test — `test.describe`, các hook (`beforeEach`,
`afterEach`, `beforeAll`) — để nhóm 10 test vừa viết một cách gọn gàng, tránh lặp lại code.
