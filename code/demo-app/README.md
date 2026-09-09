# demo-app — Web app mẫu dùng xuyên suốt Phần IV–VI

Một web app đăng nhập nhỏ (Express, HTML thuần, không framework frontend) — mục đích **duy nhất**
là làm đối tượng để `../playwright-tests/` viết automation test nhằm vào. Không phải mẫu để học
viết backend "chuẩn"; không dùng cho production (session lưu trong bộ nhớ, mất khi restart).

## Chạy thử độc lập

```bash
npm install
npm start
# mở http://localhost:3000/login — tài khoản: demo@example.com / Password123!
```

Thông thường bạn **không cần chạy tay** — `playwright.config.ts` ở `../playwright-tests/` đã khai
báo `webServer` để Playwright tự khởi động app này trước khi chạy test, tự tắt sau khi xong.

## Các route hiện có (mở rộng dần qua các chương)

| Route | Vai trò |
|---|---|
| `GET /login` | Form đăng nhập (Chương 1, TC-01 → TC-10) |
| `POST /api/login` | API xử lý đăng nhập, gọi bằng `fetch` từ `public/login.js` |
| `GET /dashboard` | Trang sau khi đăng nhập (cần session) |
| `GET /orders` | Trang ví dụ cho luồng redirect (TC-10) |
| `GET /logout` | Xoá session |
| `GET /profile` | Form hồ sơ: text input, textarea, dropdown, checkbox, upload file (Chương 13) |
| `POST /api/profile` | API cập nhật hồ sơ (multipart/form-data, dùng `multer`) |
| `POST /api/test/reset` | **Chỉ dùng cho test**: seed lại tài khoản demo (xoá lockout, reset số lần sai) — xem Chương 22 |
| `GET /healthz` | Endpoint Playwright dùng để biết server đã sẵn sàng |

## Vì sao có `/api/test/reset`?

TC-07 (khoá tài khoản sau 5 lần sai) làm thay đổi trạng thái tài khoản demo *lâu dài* (khoá 15
phút). Nếu không reset, chạy lại test suite lần 2 sẽ thấy tài khoản demo đã bị khoá từ lần chạy
trước — một dạng **test phụ thuộc trạng thái** kinh điển. `/api/test/reset` là ví dụ thực tế của kỹ
thuật "seed dữ liệu test" đã nhắc ở Chương 1, tránh test này ảnh hưởng tới test khác.
