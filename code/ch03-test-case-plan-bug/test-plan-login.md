# Test Plan: Tính năng Đăng nhập

## 1. Mục tiêu

Xác minh tính năng đăng nhập bằng email/mật khẩu hoạt động đúng theo yêu cầu, an toàn (không lộ
thông tin tài khoản qua thông báo lỗi), và có cơ chế khoá tài khoản chống brute-force.

## 2. Phạm vi (Scope)

**Trong phạm vi:**
- Đăng nhập bằng email + mật khẩu (form trên web).
- Validation phía client (định dạng email, field bắt buộc).
- Cơ chế khoá tài khoản sau nhiều lần sai.
- Redirect sau khi đăng nhập thành công.

**Ngoài phạm vi (out of scope):**
- Đăng nhập bằng mạng xã hội (Google/Facebook) — tính năng riêng, chưa triển khai.
- Đăng nhập bằng OTP/2FA — nằm trong roadmap Q2, chưa test ở giai đoạn này.
- Hiệu năng chịu tải (load testing) khi có nhiều người đăng nhập cùng lúc — do team Performance
  đảm nhận riêng.

## 3. Chiến lược kiểm thử (Test Strategy)

| Cấp độ | Ai làm | Công cụ |
|---|---|---|
| Unit test (validate email, hash password) | Dev | Jest (phía backend) |
| Integration test (API `/login` + database) | Dev + QA | Jest/Supertest |
| E2E test (luồng người dùng thật qua UI) | QA (automation) | Playwright — xem Phần IV |
| Manual/Exploratory | QA | Test tay các case biên, UX |

## 4. Môi trường kiểm thử

- Staging environment: `https://staging.demo-app.local`
- Tài khoản test: `demo@example.com` / `Password123!` (seed sẵn trong DB staging)
- Trình duyệt: Chrome (chính), Firefox + Safari (smoke test trước release)

## 5. Tiêu chí Pass/Fail (Entry/Exit Criteria)

**Entry criteria** (điều kiện để bắt đầu test): build đã deploy thành công lên staging, API
`/login` trả về đúng response theo tài liệu API.

**Exit criteria** (điều kiện để coi là test xong, đủ điều kiện release):
- 100% test case mức **Critical/High** (xem `code/ch01-sdlc/test-case-list-login.md`) pass.
- Không còn bug **mức nghiêm trọng Blocker/Critical** nào đang mở.
- Automation regression suite (Playwright) chạy xanh trên CI.

## 6. Rủi ro (Risks)

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| Cơ chế khoá tài khoản (TC-07) khó test tự động do phụ thuộc thời gian chờ 15 phút | Trung bình | Seed thẳng trạng thái "đã sai 4 lần" vào DB test thay vì test tuần tự thật (xem ghi chú ở Chương 1) |
| Thay đổi API `/login` không được thông báo trước | Cao | Thống nhất API contract với backend trước khi code test |

## 7. Lịch trình

| Mốc | Ngày (ví dụ) |
|---|---|
| Bắt đầu viết test case | Sprint N, ngày 1 |
| Test case review với dev | Sprint N, ngày 2 |
| Test thủ công lần đầu (build alpha) | Sprint N, ngày 4 |
| Viết automation test (Playwright) | Sprint N, ngày 5–7 |
| Regression đầy đủ trước release | Sprint N, ngày 9 |
