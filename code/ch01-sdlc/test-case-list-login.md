# Bộ test case: Tính năng Đăng nhập

**Tính năng:** Người dùng đăng nhập vào hệ thống bằng email + mật khẩu.
**Precondition chung:** Đã có tài khoản `demo@example.com` / `Password123!` tồn tại trong hệ thống, tài khoản chưa bị khoá.

| ID | Tiêu đề | Tiền điều kiện | Các bước | Dữ liệu vào | Kết quả mong đợi |
|---|---|---|---|---|---|
| TC-01 | Đăng nhập thành công với tài khoản hợp lệ | Ở trang `/login` | 1. Nhập email và mật khẩu hợp lệ<br>2. Bấm "Đăng nhập" | email: `demo@example.com`<br>password: `Password123!` | Chuyển sang trang `/dashboard`, hiển thị tên người dùng ở góc phải |
| TC-02 | Đăng nhập thất bại với sai mật khẩu | Ở trang `/login` | 1. Nhập email hợp lệ, mật khẩu sai<br>2. Bấm "Đăng nhập" | email: `demo@example.com`<br>password: `SaiRoi123` | Vẫn ở trang `/login`, hiển thị thông báo lỗi "Email hoặc mật khẩu không đúng" |
| TC-03 | Đăng nhập thất bại với email không tồn tại | Ở trang `/login` | 1. Nhập email chưa từng đăng ký<br>2. Bấm "Đăng nhập" | email: `khongton@example.com`<br>password: `Password123!` | Vẫn ở trang `/login`, hiển thị thông báo lỗi "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không) |
| TC-04 | Bỏ trống trường email | Ở trang `/login` | 1. Để trống email, nhập mật khẩu<br>2. Bấm "Đăng nhập" | email: `` (trống)<br>password: `Password123!` | Không submit được form, hiển thị lỗi validation "Email là bắt buộc" ngay dưới field |
| TC-05 | Bỏ trống trường mật khẩu | Ở trang `/login` | 1. Nhập email, để trống mật khẩu<br>2. Bấm "Đăng nhập" | email: `demo@example.com`<br>password: `` (trống) | Không submit được form, hiển thị lỗi validation "Mật khẩu là bắt buộc" |
| TC-06 | Sai định dạng email | Ở trang `/login` | 1. Nhập chuỗi không đúng định dạng email<br>2. Bấm "Đăng nhập" | email: `khong-phai-email`<br>password: `Password123!` | Không submit được form, hiển thị lỗi validation "Email không đúng định dạng" |
| TC-07 | Khoá tài khoản sau 5 lần đăng nhập sai | Ở trang `/login` | 1. Nhập sai mật khẩu liên tiếp 5 lần | email: `demo@example.com`<br>password: sai (5 lần) | Sau lần thứ 5, hiển thị thông báo "Tài khoản tạm khoá, thử lại sau 15 phút", nút "Đăng nhập" bị disable |
| TC-08 | Mật khẩu được ẩn theo mặc định, có thể hiện | Ở trang `/login` | 1. Nhập mật khẩu vào field<br>2. Bấm icon "hiện mật khẩu" | password: `Password123!` | Mặc định ký tự hiển thị dạng `•••`; sau khi bấm icon, hiển thị plain text đúng giá trị đã nhập |
| TC-09 | Đăng nhập bằng phím Enter (không bấm nút) | Ở trang `/login` | 1. Nhập email + mật khẩu hợp lệ<br>2. Nhấn Enter thay vì bấm nút | email: `demo@example.com`<br>password: `Password123!` | Hành vi giống hệt TC-01 — chuyển sang `/dashboard` |
| TC-10 | Redirect về trang trước đó sau khi đăng nhập | Truy cập `/orders` khi chưa đăng nhập (bị redirect về `/login?redirect=/orders`) | 1. Đăng nhập thành công | email: `demo@example.com`<br>password: `Password123!` | Sau khi đăng nhập, chuyển thẳng về `/orders` thay vì `/dashboard` mặc định |

## Ghi chú

- TC-01, TC-02, TC-04, TC-06 sẽ được hiện thực trực tiếp thành test Playwright ở Chương 11 —
  đây là ví dụ điển hình cho việc "test case viết ở Phần I" trở thành "automation test viết ở
  Phần IV", đúng tinh thần shift-left đã nói trong Chương 1.
- TC-07 (khoá tài khoản) là ví dụ về case cần **dữ liệu/trạng thái đặc biệt** (tài khoản đã bị
  sai 4 lần trước đó) — sẽ được dùng làm ví dụ cho kỹ thuật seed dữ liệu test ở Phần V.
