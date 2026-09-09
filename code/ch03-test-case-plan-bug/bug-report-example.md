# Bug Report: BUG-142

| Trường | Giá trị |
|---|---|
| **ID** | BUG-142 |
| **Tiêu đề** | Tài khoản không bị khoá sau 5 lần đăng nhập sai liên tiếp |
| **Test case liên quan** | TC-07 (`code/ch01-sdlc/test-case-list-login.md`) |
| **Mức độ nghiêm trọng (Severity)** | Cao (High) — lỗ hổng bảo mật, cho phép brute-force mật khẩu không giới hạn |
| **Mức độ ưu tiên (Priority)** | Cao (High) — cần sửa trước khi release |
| **Môi trường** | Staging, Chrome 128, build #482 |
| **Người báo cáo** | QA Team |
| **Trạng thái** | Open |

## Các bước tái hiện (Steps to Reproduce)

1. Truy cập `/login`.
2. Nhập email `demo@example.com`, mật khẩu sai (ví dụ `SaiRoi123`).
3. Bấm "Đăng nhập". Lặp lại bước 2–3 đủ **5 lần liên tiếp**.
4. Ở lần thử thứ 6, nhập đúng mật khẩu `Password123!` và bấm "Đăng nhập".

## Kết quả mong đợi (Expected Result)

Sau lần sai thứ 5, tài khoản phải bị khoá tạm thời — hệ thống hiển thị thông báo "Tài khoản tạm
khoá, thử lại sau 15 phút" và **từ chối đăng nhập ngay cả khi nhập đúng mật khẩu** ở lần thứ 6.

## Kết quả thực tế (Actual Result)

Ở lần thử thứ 6 với mật khẩu đúng, hệ thống **cho đăng nhập thành công bình thường**, không có
thông báo khoá tài khoản nào xuất hiện ở bất kỳ bước nào từ 1–5. Cơ chế khoá tài khoản dường như
chưa được áp dụng.

## Ảnh chụp màn hình / Log

```
[2026-09-10 09:14:22] POST /api/login -> 401 (attempt 1)
[2026-09-10 09:14:25] POST /api/login -> 401 (attempt 2)
[2026-09-10 09:14:28] POST /api/login -> 401 (attempt 3)
[2026-09-10 09:14:31] POST /api/login -> 401 (attempt 4)
[2026-09-10 09:14:34] POST /api/login -> 401 (attempt 5)
[2026-09-10 09:14:40] POST /api/login -> 200 (attempt 6, đúng mật khẩu) — KHÔNG bị chặn
```

## Mức độ ảnh hưởng (Impact)

Kẻ tấn công có thể thử mật khẩu không giới hạn số lần (brute-force attack) mà không bị chặn, tăng
nguy cơ chiếm được tài khoản người dùng bằng mật khẩu yếu.

## Ghi chú cho Dev

Nghi ngờ nguyên nhân: middleware đếm số lần đăng nhập sai (`loginAttemptCounter`) có thể chưa được
gắn vào route `/api/login`, hoặc bộ đếm bị reset sai thời điểm. Đề xuất kiểm tra lại logic ở
service xử lý đăng nhập.
