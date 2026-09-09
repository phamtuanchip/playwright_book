# Chương 9: Giới thiệu demo app dùng xuyên suốt sách

## Mục tiêu học

- Chạy được demo app và hiểu vai trò từng route của nó.
- Hiểu vì sao webServer trong `playwright.config.ts` giúp không cần mở tay terminal chạy app.
- Thấy được một bug thật, tự phát hiện được nhờ chính automation test — không phải ví dụ giả định.

> Code mẫu: `code/demo-app/` — web app đăng nhập nhỏ (Express), là đối tượng test cho toàn bộ Phần
> IV–VI. Đọc `README.md` trong đó để biết đầy đủ route hiện có.

## 9.1. Vì sao cần một demo app riêng?

Từ Chương 10 trở đi, sách sẽ dạy Playwright bằng ví dụ thật, chạy được — nhưng test nhằm vào một
trang web công khai (như `ch08-smoke.spec.ts` nhằm vào `playwright.dev`) có vấn đề: trang đó có thể
đổi giao diện bất cứ lúc nào (làm ví dụ trong sách lỗi thời), và không có sẵn các tình huống cần
minh hoạ (khoá tài khoản, validation form, upload file...).

Giải pháp: một **demo app tự viết, nằm trong repo**, không đổi ngoài ý muốn, và được thiết kế sẵn
để có đủ tình huống cần cho các chương tiếp theo — bắt đầu bằng đúng tính năng "Đăng nhập" đã dùng
xuyên suốt Phần I (bộ test case ở Chương 1, test plan/bug report ở Chương 3).

## 9.2. Chạy demo app

```bash
cd code/demo-app
npm install
npm start
```

Mở `http://localhost:3000/login`, đăng nhập bằng `demo@example.com` / `Password123!`.

Trong thực tế, bạn hiếm khi cần chạy tay như trên — mục 9.4 sẽ nối `playwright-tests` với app này
để Playwright tự lo việc khởi động.

## 9.3. Cấu trúc demo app

```
demo-app/
├── server.js         # Express app: định nghĩa các route
├── src/store.js       # "database" trong bộ nhớ: user, session
├── src/views.js        # sinh HTML cho từng trang (login, dashboard, orders)
└── public/
    ├── login.js        # validate form + gọi API đăng nhập (chạy trong trình duyệt)
    └── style.css
```

Logic đăng nhập (route `POST /api/login` trong `server.js`) hiện thực **chính xác** các quy tắc đã
định nghĩa trong bộ test case Chương 1 — đọc song song hai file để đối chiếu:

```js
// server.js — trích đoạn xử lý khoá tài khoản (tương ứng TC-07)
if (!user || user.password !== password) {
  if (user) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.lockedUntil = Date.now() + LOCK_DURATION_MS;
      return res.json({ ok: false, locked: true, message: "Tài khoản tạm khoá, thử lại sau 15 phút" });
    }
  }
  return res.json({ ok: false, message: "Email hoặc mật khẩu không đúng" }); // TC-02, TC-03
}
```

Validation phía client (TC-04, TC-05, TC-06 — bỏ trống field, sai định dạng email) nằm trong
`public/login.js`, chạy **trước khi** gọi API, đúng tinh thần "chặn lỗi sớm nhất có thể" đã học ở
Chương 1 (shift-left) — chỉ khác là áp dụng ở tầng UI thay vì tầng quy trình.

## 9.4. Nối demo app với Playwright: `webServer`

Mở `code/playwright-tests/playwright.config.ts` — hai phần mới so với Chương 8:

```ts
export default defineConfig({
  // ...
  use: {
    baseURL: "http://localhost:3000", // test chỉ cần page.goto("/login"), không cần URL đầy đủ
  },
  webServer: {
    command: "npm start",          // lệnh khởi động demo app
    cwd: "../demo-app",             // chạy lệnh đó trong thư mục demo-app
    url: "http://localhost:3000/healthz", // Playwright chờ URL này trả về OK rồi mới chạy test
    reuseExistingServer: !process.env.CI, // nếu app đã chạy sẵn (lúc dev), dùng luôn, không khởi động lại
  },
});
```

Nhờ đó, chỉ cần `npm test` trong `playwright-tests/` — Playwright tự chạy `npm start` trong
`demo-app/`, đợi `/healthz` trả 200 OK, chạy hết test, rồi tự tắt app. Đây chính là cách một pipeline
CI/CD thật (Chương 19) khởi động ứng dụng cần test mà không cần bước thủ công nào.

## 9.5. Một bug thật, phát hiện ngay khi viết test đầu tiên

Khi viết `code/playwright-tests/tests/ch09-demo-app-smoke.spec.ts` để xác minh demo app, dòng
sau ban đầu làm test **fail**:

```ts
await page.getByLabel("Mật khẩu").fill("Password123!");
```

Lỗi Playwright báo:

```
strict mode violation: getByLabel('Mật khẩu') resolved to 2 elements:
  1) <input id="password" ...> aka getByRole('textbox', { name: 'Mật khẩu' })
  2) <button ... aria-label="Hiện mật khẩu">👁</button> aka getByRole('button', { name: 'Hiện mật khẩu' })
```

**Nguyên nhân:** nút "hiện mật khẩu" (con mắt 👁) có `aria-label="Hiện mật khẩu"` — chứa sẵn chuỗi
"Mật khẩu" bên trong. `getByLabel()` so khớp theo *accessible name*, và mặc định so khớp theo kiểu
chứa chuỗi con (substring), nên nó khớp luôn cả hai phần tử.

**Cách sửa** (đã áp dụng trong `code/demo-app/src/views.js`): đổi `aria-label` của nút thành "Hiện
ký tự" — không còn chứa chuỗi "Mật khẩu", loại bỏ nhập nhằng.

Đây không phải ví dụ dựng sẵn — đây là bug **thật xảy ra khi viết chương này**, và minh hoạ chính
xác giá trị của automation test: viết một test đơn giản đã lộ ra một vấn đề về khả năng truy cập
(accessibility)/thiết kế locator mà việc test tay rất dễ bỏ sót. Chương 11 sẽ quay lại chủ đề chọn
locator ổn định một cách bài bản hơn.

## Bài tập

1. Chạy `cd code/playwright-tests && npm test` — xác nhận 4 test (Chương 8 + 9) đều pass.
2. Mở `code/demo-app/src/views.js`, thử đổi `aria-label="Hiện ký tự"` lại thành `aria-label="Hiện
   mật khẩu"`, chạy lại `npm test` — xác nhận bạn tái hiện được đúng lỗi ở mục 9.5.
3. Đọc toàn bộ `server.js` (chỉ ~90 dòng), với mỗi route, tìm test case tương ứng trong
   `code/ch01-sdlc/test-case-list-login.md` (nếu có).
4. Xoá cờ `reuseExistingServer: !process.env.CI` (để nó luôn là `false`), chạy `npm test` hai lần
   liên tiếp — quan sát Playwright có báo lỗi "port đã được dùng" không, và giải thích tại sao cờ
   này tồn tại.

## Lỗi thường gặp

- **Quên `npm install` trong `code/demo-app/` trước khi chạy test lần đầu**: `webServer` sẽ chạy
  `npm start` nhưng thất bại vì thiếu `node_modules` — Playwright báo lỗi timeout chờ URL sẵn sàng.
- **Chạy test 2 lần liên tiếp mà quên seed lại dữ liệu**: nếu một test làm tài khoản demo bị khoá
  (như thử nghiệm ở bài tập 2 nếu bạn tự viết thêm test TC-07), lần chạy sau sẽ fail vì tài khoản
  vẫn đang khoá — đây là lý do `/api/test/reset` tồn tại (xem README của `demo-app`).
- **Nhầm lẫn giữa lỗi do demo app (bug thật) và lỗi do viết test sai**: khi test fail, luôn đọc kỹ
  thông báo lỗi trước (như mục 9.5) — nhiều khi test "fail" lại là test đang làm đúng việc của nó:
  phát hiện vấn đề thật.

## Tóm tắt & tiếp theo

- Demo app là một Express app nhỏ, tự viết, hiện thực đúng các quy tắc từ bộ test case Chương 1.
- `webServer` trong `playwright.config.ts` giúp Playwright tự khởi động/tắt app khi chạy test.
- Automation test có thể phát hiện lỗi thật (như lỗi `aria-label` trùng lặp) mà không phải lúc nào
  cũng do "cách viết test sai".

Phần III (Cài đặt môi trường) đến đây đã hoàn thành. Phần IV — nội dung trọng tâm nhất của sách —
bắt đầu ngay từ Chương 10: kiến trúc Playwright, và từ Chương 11, đi sâu vào locators, actions,
assertions bằng chính demo app và bộ test case đã chuẩn bị.
