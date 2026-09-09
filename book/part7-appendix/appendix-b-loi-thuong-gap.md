# Phụ lục B: Các lỗi thường gặp và cách xử lý (tra cứu nhanh theo triệu chứng)

Tổng hợp toàn bộ mục "Lỗi thường gặp" trong 30 chương, tổ chức theo **triệu chứng** để tra cứu
nhanh khi gặp lỗi tương tự — mỗi dòng trỏ lại chương gốc có giải thích chi tiết.

## Test fail ngẫu nhiên (flaky), không nhất quán

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| Test đôi khi pass đôi khi fail, không đổi gì trong code | Dùng `waitForTimeout` thay vì auto-waiting; máy chạy nhanh/chậm khác nhau | Chương 6, 14 |
| Test pass riêng lẻ nhưng fail khi chạy cùng lúc với test khác | Nhiều test dùng chung dữ liệu/tài khoản, chạy song song gây đụng độ | Chương 11, 23 |
| Test pass trên máy dev, fail trên CI | Thiếu `npm ci`/cài đặt đầy đủ trên CI; visual test baseline tạo trên OS khác | Chương 19, 21 |

## Locator không tìm được phần tử, hoặc tìm nhầm

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| `strict mode violation: resolved to N elements` | Locator khớp nhiều phần tử — thường do `aria-label`/text trùng lặp một phần | Chương 9, 11 |
| Locator hoạt động lúc viết, vỡ sau khi dev đổi UI | Dùng CSS selector/cấu trúc DOM thay vì role/label | Chương 6, 11, 29 |
| `getByLabel` không tìm được input | Input thiếu `<label for>` liên kết, hoặc dùng `aria-label` không khớp | Chương 11 |

## Network / async không như mong đợi

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| UI "treo im lặng" khi server lỗi | Code frontend gọi `res.json()` mà không kiểm tra `res.ok`/bọc try-catch | Chương 14 |
| `waitForResponse` bị treo mãi | Gọi `waitForResponse` SAU khi đã trigger request, bị lỡ response | Chương 14, 20 |
| Test gọi API nhưng `page` vẫn coi là chưa đăng nhập | Dùng `request` (độc lập) thay vì `page.request` (chung context) | Chương 20 |

## Cấu hình / môi trường

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| `Executable doesn't exist` khi chạy test | Quên `npx playwright install` sau khi `npm install` | Chương 8 |
| `webServer` timeout chờ URL sẵn sàng | Thiếu `npm install` ở project server (demo-app), hoặc chưa chạy đúng thư mục | Chương 9, 19 |
| CI fail ở project firefox/webkit nhưng chromium pass | Chỉ cài Chromium (`playwright install chromium`), thiếu 2 engine còn lại | Chương 24 |
| MCP server treo, không phản hồi | Quên `await server.connect(transport)` | Chương 27 |

## Reporting / debug

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| Không có báo cáo HTML Allure dù đã cài `allure-playwright` | Thiếu bước sinh báo cáo cuối bằng Allure CLI (cần Java) — package Node.js chỉ ghi dữ liệu thô | Chương 18 |
| Trace/report quá nặng, chiếm nhiều dung lượng | Đặt `trace: "on"` cho chạy hàng ngày thay vì `"on-first-retry"` | Chương 17 |

## Tư duy / quy trình (không phải lỗi kỹ thuật)

| Triệu chứng | Nguyên nhân thường gặp | Xem lại |
|---|---|---|
| Test pass nhưng không phát hiện được bug thật | Assertion mơ hồ, không khớp đúng "Kết quả mong đợi" gốc | Chương 3, 6, 13 |
| Automation suite bị bỏ qua khi báo fail | Tích tụ flaky test lâu ngày, đội ngũ mất niềm tin vào suite | Chương 6 |
| Code sinh bởi `codegen`/AI dùng thẳng, không sửa | Thiếu bước review/tinh gọn trước khi coi là test hoàn chỉnh | Chương 17, 29 |

## Cách dùng phụ lục này

Khi gặp lỗi mới không có trong bảng: (1) đọc kỹ thông báo lỗi đầy đủ trước khi tra cứu, (2) tìm
chương liên quan tới **loại thao tác** đang thực hiện (locator, network, config...), (3) áp dụng
quy trình debug đã học ở Chương 17 (Trace Viewer, Console tab) trước khi đoán mò.
