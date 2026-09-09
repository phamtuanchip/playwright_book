# Chương 14: Auto-waiting, xử lý bất đồng bộ, network

## Mục tiêu học

- Hiểu chính xác auto-waiting của Playwright chờ những điều kiện gì.
- Dùng `page.waitForResponse()` khi cần chờ/kiểm tra một network request cụ thể.
- Dùng `page.route()` để giả lập network chậm hoặc lỗi server — kiểm tra được những tình huống
  gần như không thể tái hiện ổn định qua backend thật.

> Code mẫu: `code/playwright-tests/tests/ch14-auto-waiting-network.spec.ts` — 3 test minh hoạ cả ba
> kỹ thuật trên, và một **bug thật** được phát hiện + sửa ngay trong chương này.

## 14.1. Auto-waiting chính xác chờ những gì?

Từ Chương 10 đến giờ, sách nhắc nhiều lần "auto-waiting" nhưng chưa giải thích **chính xác**
Playwright chờ điều kiện gì trước khi thực hiện một action như `click()`:

1. Phần tử đã được **gắn vào DOM** (attached).
2. Phần tử **hiển thị** (visible — không `display:none`, không `visibility:hidden`).
3. Phần tử **ổn định** (stable — không đang trong animation/di chuyển).
4. Phần tử **có thể nhận sự kiện** (không bị phần tử khác đè lên).
5. Phần tử **không bị disable** (với các action như click, fill).

Playwright kiểm tra lại đủ 5 điều kiện này **liên tục** (poll) cho tới khi tất cả đúng, hoặc hết
timeout (mặc định 30 giây cho action, 5 giây cho `expect()`). Đây là lý do test ở
`ch14-auto-waiting-network.spec.ts` chờ được network chậm 1.5 giây **mà không cần code thêm gì**:

```ts
await page.route("**/api/login", async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // giả lập mạng chậm 1.5s
  await route.continue();
});
// ...
await expect(page).toHaveURL("/dashboard"); // tự chờ tới 5s mặc định, đủ cho 1.5s giả lập
```

## 14.2. `page.route()` — chặn và điều khiển network request

`page.route()` cho phép chặn một request khớp pattern (URL hoặc glob), rồi quyết định: cho đi tiếp
(`route.continue()`), trả về response giả (`route.fulfill()`), hoặc huỷ (`route.abort()`) — toàn bộ
xảy ra ở tầng trình duyệt, **không cần sửa gì ở server thật**.

```ts
// Giả lập server trả lỗi 500 — không cần code gì trong demo-app để tái hiện tình huống này.
await page.route("**/api/login", (route) =>
  route.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" })
);
```

Đây là kỹ thuật mạnh: nhiều tình huống lỗi (server quá tải, mất kết nối giữa chừng, response méo)
**rất khó hoặc không thể** tái hiện ổn định bằng cách tác động vào server thật, nhưng lại dễ dàng
và tái lập 100% khi giả lập ở tầng network trong test.

## 14.3. Một bug thật, phát hiện nhờ giả lập lỗi 500

Khi viết test "giả lập lỗi server 500" ở trên, test **fail**:

```
Expected: "Có lỗi xảy ra, vui lòng thử lại."
Received: ""
```

Đọc lại `public/login.js` (trước khi sửa):

```js
const res = await fetch("/api/login", { /* ... */ });
const data = await res.json(); // ← nếu res không phải JSON hợp lệ, dòng này NÉM LỖI
```

**Nguyên nhân:** khi server trả về lỗi 500 với body không phải JSON (như test giả lập:
`"Internal Server Error"` dạng text thuần), `res.json()` ném lỗi parse — lỗi này **không được bắt**
(không có `try/catch`), nên UI không hiển thị gì cả, người dùng thấy nút bấm "không phản hồi" mà
không rõ vì sao.

**Cách sửa** (đã áp dụng trong `public/login.js`):

```js
let data;
try {
  const res = await fetch("/api/login", { /* ... */ });
  if (!res.ok) throw new Error("http-error"); // kiểm tra res.ok TRƯỚC KHI gọi res.json()
  data = await res.json();
} catch {
  serverError.textContent = "Có lỗi xảy ra, vui lòng thử lại.";
  return;
}
```

Đây là bug **thật thứ hai** phát hiện được nhờ automation test trong sách này (bug đầu tiên ở
Chương 9, lỗi `aria-label`) — và minh hoạ chính xác giá trị của `page.route()`: test tay rất khó
tái hiện lỗi server 500 một cách chủ động và lặp lại được, nhưng automation test làm được dễ dàng.

## 14.4. `waitForResponse` — chờ và kiểm tra một request cụ thể

Đôi khi bạn cần **chính xác response** của một request, không chỉ chờ UI cập nhật:

```ts
const responsePromise = page.waitForResponse("**/api/login"); // đăng ký chờ TRƯỚC khi trigger

await page.getByRole("button", { name: "Đăng nhập" }).click(); // trigger request

const response = await responsePromise;
expect(response.status()).toBe(200);

const requestBody = JSON.parse(response.request().postData() || "{}");
expect(requestBody.email).toBe("demo@example.com"); // xác nhận đúng dữ liệu đã GỬI lên server
```

**Lưu ý thứ tự:** phải gọi `page.waitForResponse()` **trước** khi trigger action gây ra request đó
(ở đây là `click()`) — nếu gọi sau, có rủi ro request đã hoàn tất trước khi Playwright kịp "lắng
nghe", khiến `await responsePromise` treo mãi. Đây là kỹ thuật nền tảng sẽ dùng lại ở Chương 20 khi
viết API test.

## Bài tập

1. Chạy `npm test`, xác nhận toàn bộ 25 test pass.
2. Trong `public/login.js`, tạm bỏ khối `try/catch` vừa thêm (quay về code cũ), chạy lại riêng file
   `ch14-auto-waiting-network.spec.ts` — xác nhận bạn tái hiện đúng lỗi ở mục 14.3. Khôi phục lại
   sau khi thử xong.
3. Viết thêm một test dùng `page.route()` để giả lập tình huống "mất kết nối hoàn toàn"
   (`route.abort()` thay vì `route.fulfill()`) khi đăng nhập — quan sát UI phản ứng thế nào, và
   thông báo lỗi hiện tại có phù hợp với tình huống này không.
4. Dùng `waitForResponse` để viết một test xác nhận: khi đăng nhập **sai** mật khẩu, request gửi
   lên `/api/login` vẫn chứa đúng email đã nhập (không bị rỗng hay sai định dạng).

## Lỗi thường gặp

- **Không bọc `res.json()` trong try/catch, hoặc quên kiểm tra `res.ok`**: xem lỗi thật ở mục 14.3
  — đây là lỗi rất phổ biến trong code frontend thực tế, không riêng gì demo app của sách.
- **Gọi `page.waitForResponse()` SAU khi đã trigger request**: dễ gây treo test do bỏ lỡ response
  (xem lưu ý ở mục 14.4).
- **Dùng `page.route()` để mock quá nhiều, che mất lỗi thật của backend**: mock lỗi mạng/lỗi server
  có mục đích cụ thể (kiểm tra UI xử lý lỗi) — không nên mock luôn cả những request cần test với dữ
  liệu backend thật (như toàn bộ Chương 11-13 đã làm).

## Tóm tắt & tiếp theo

- Auto-waiting kiểm tra 5 điều kiện (attached, visible, stable, receives events, enabled) liên tục
  cho tới khi đúng hoặc hết timeout — đủ để xử lý cả độ trễ mạng thực tế.
- `page.route()` giả lập network (chậm, lỗi, mất kết nối) mà không cần sửa server thật — phát hiện
  được một bug thật (thiếu xử lý lỗi HTTP trong `login.js`).
- `waitForResponse()` chờ và kiểm tra chính xác một request/response cụ thể — nền tảng cho API
  testing ở Chương 20.

Chương 15 chuyển sang một chủ đề khác: tổ chức code test bằng Page Object Model — khi số lượng test
đã khá nhiều (25 test qua 4 file), đã đến lúc cần một cách tổ chức bài bản hơn để dễ bảo trì.
