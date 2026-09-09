# Chương 13: Làm việc với form — input, dropdown, upload file

## Mục tiêu học

- Thao tác đúng với text input, textarea, `<select>` dropdown, checkbox.
- Upload file trong test bằng `setInputFiles`.
- Xác minh dữ liệu **thực sự được lưu** (reload trang, không chỉ tin vào UI tạm thời).

> Code mẫu: `code/playwright-tests/tests/ch13-form-input-upload.spec.ts` — 5 test thao tác với
> trang Hồ sơ (`/profile`, mới thêm vào demo app ở chương này).

## 13.1. Text input và textarea

```ts
await page.getByLabel("Tên hiển thị").fill("Trần Văn A");
await page.getByLabel("Giới thiệu").fill("QA Engineer, thích viết automation test.");
```

`fill()` xoá sạch nội dung cũ rồi điền giá trị mới — dùng được cho cả `<input>` và `<textarea>`,
không cần phân biệt cách gọi.

## 13.2. Dropdown (`<select>`)

```ts
await page.getByLabel("Quốc gia").selectOption("JP");
```

`selectOption()` nhận **giá trị (`value`)** của `<option>`, không phải text hiển thị — trong demo
app, `<option value="JP">Nhật Bản</option>`, nên gọi `selectOption("JP")` chứ không phải
`selectOption("Nhật Bản")` (dù `selectOption({ label: "Nhật Bản" })` cũng dùng được nếu cần chọn
theo text hiển thị).

## 13.3. Checkbox

```ts
const checkbox = page.getByLabel("Nhận email thông báo");
await expect(checkbox).not.toBeChecked(); // xác minh trạng thái ban đầu

await checkbox.check();    // luôn đảm bảo cuối cùng ở trạng thái "đã tick" (bỏ qua nếu đã tick sẵn)
await checkbox.uncheck();  // luôn đảm bảo cuối cùng ở trạng thái "chưa tick"
```

Dùng `check()`/`uncheck()` thay vì `click()` cho checkbox: hai hàm này **idempotent** (gọi nhiều
lần không đổi kết quả) — `click()` thì mỗi lần gọi sẽ *đảo ngược* trạng thái, dễ gây lỗi logic nếu
gọi nhầm số lần.

## 13.4. Upload file

```ts
import path from "path";

const filePath = path.join(__dirname, "..", "fixtures", "avatar.png");
await page.getByLabel("Ảnh đại diện").setInputFiles(filePath);
```

`setInputFiles()` gán trực tiếp file vào `<input type="file">` — **không** cần Playwright thật sự
mở hộp thoại chọn file của hệ điều hành (vốn không thể tự động hoá được, vì đó là UI ngoài trang
web). File mẫu `fixtures/avatar.png` là một ảnh PNG 1×1 pixel hợp lệ, đủ nhỏ để commit vào repo,
đủ thật để server xử lý như file thật.

## 13.5. Nguyên tắc quan trọng: xác minh dữ liệu *thực sự* được lưu

Nhìn kỹ 4 test đầu trong `ch13-form-input-upload.spec.ts` — mỗi test đều có bước `page.reload()`
**sau khi** lưu, rồi assert lại giá trị:

```ts
await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
await expect(page.locator("#server-success")).toHaveText("Đã lưu hồ sơ.");

// Không dừng ở đây! Tải lại trang để chắc chắn dữ liệu ĐÃ LƯU, không chỉ hiển thị tạm.
await page.reload();
await expect(page.getByLabel("Tên hiển thị")).toHaveValue("Trần Văn A");
```

Nếu chỉ kiểm tra thông báo "Đã lưu hồ sơ." mà không `reload()`, test sẽ **pass ngay cả khi server
không thực sự lưu dữ liệu** (ví dụ do bug ở `POST /api/profile`) — vì thông báo đó chỉ chứng minh
request đã gửi thành công, không chứng minh dữ liệu đã được lưu. Đây là một dạng cụ thể của Vấn đề
3 (Chương 6): assertion phải khớp đúng "kết quả mong đợi" — ở đây, kết quả mong đợi thật sự là "dữ
liệu được lưu lại", không phải "có thông báo thành công hiện ra".

## Bài tập

1. Chạy `npm test` trong `code/playwright-tests/`, xác nhận toàn bộ 22 test pass.
2. Trong `code/demo-app/server.js`, route `POST /api/profile`, thử cố tình **không** gọi
   `updateProfile()` (chỉ trả `res.json({ ok: true, profile: current })` với dữ liệu cũ) — chạy lại
   test "cập nhật tên hiển thị..." và quan sát: test có phát hiện ra lỗi này không? Sửa lại code sau
   khi thử xong.
3. Viết thêm một test cho trường hợp: chọn quốc gia "Hoa Kỳ" (`US`), lưu, sau đó đổi sang "Việt
   Nam" (`VN`), lưu lại, và xác minh giá trị cuối cùng đúng là `VN` (không phải giá trị trung gian).
4. Đọc `fixtures/avatar.png` bằng một công cụ xem ảnh — xác nhận đây là ảnh PNG 1×1 pixel hợp lệ,
   không phải file giả.

## Lỗi thường gặp

- **Dùng `selectOption()` với text hiển thị thay vì `value`**: gây lỗi "option không tồn tại" nếu
  `value` và label khác nhau (như ví dụ `VN`/`"Việt Nam"` ở trên) — luôn kiểm tra `value` thật trong
  HTML nếu không chắc.
- **Dùng `click()` thay vì `check()`/`uncheck()` cho checkbox**: dễ gây lỗi logic khi test chạy lại
  nhiều lần hoặc trạng thái ban đầu không như dự đoán, vì `click()` chỉ *đảo ngược*, không *đảm
  bảo* trạng thái đích.
- **Chỉ kiểm tra thông báo thành công, quên xác minh dữ liệu thực sự lưu**: xem mục 13.5 — đây là
  lỗi phổ biến khiến test "pass giả" dù backend có bug.
- **Quên rằng `setInputFiles` cần đường dẫn tuyệt đối (hoặc tương đối đúng)**: dùng `path.join`
  với `__dirname` để đường dẫn luôn đúng bất kể chạy test từ thư mục nào.

## Tóm tắt & tiếp theo

- `fill()` cho text/textarea, `selectOption()` cho dropdown (theo `value`), `check()`/`uncheck()`
  cho checkbox, `setInputFiles()` cho upload file.
- Luôn xác minh dữ liệu *thực sự lưu* (ví dụ bằng `reload()`) thay vì chỉ tin vào thông báo UI.

Chương 14 học cách xử lý những tình huống khó hơn: chờ đúng cách khi trang có thao tác bất đồng bộ,
và cách quan sát/can thiệp vào network request — nền tảng để hiểu sâu hơn cơ chế auto-waiting đã
dùng ngầm định từ đầu sách tới giờ.
