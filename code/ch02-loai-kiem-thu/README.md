# Ví dụ Chương 2 — Unit test vs Integration test

Module nghiệp vụ nhỏ (`cart.js`: tính tiền giỏ hàng) minh hoạ sự khác biệt giữa unit test và
integration test, dùng thuần Node.js (`node:assert`), không cần cài framework nào — chạy được
ngay cả trước khi tới Chương 7 (cài đặt môi trường).

## Chạy thử

```bash
node unit-test.js
node integration-test.js
```

## Các file

- `cart.js` — 4 hàm: `calculateSubtotal`, `applyDiscount`, `formatCurrencyVND` (từng hàm độc
  lập), và `calculateTotal` (gọi phối hợp cả 3 hàm trên).
- `unit-test.js` — mỗi test chỉ gọi **một** hàm, cô lập hoàn toàn.
- `integration-test.js` — test `calculateTotal()`, xác minh 3 hàm **ăn khớp khi ghép lại**.

## Vì sao có cả hai vẫn cần thiết?

Thử tự tay gây lỗi để thấy rõ khác biệt: mở `cart.js`, đổi dòng `return subtotal - (subtotal *
discountPercent) / 100;` thành `return (subtotal - (subtotal * discountPercent) / 100).toString();`
(biến kết quả `applyDiscount` từ number thành string).

- `node unit-test.js` — `testApplyDiscount` vẫn **pass**, vì `assert.strictEqual(result,
  180000)`... thực ra sẽ **fail** vì so sánh string với number. Thử tiếp: nếu bạn sửa cả assertion
  đó để so sánh string, unit test sẽ pass giả — nhưng `calculateTotal` (integration) sẽ lộ lỗi vì
  `formatCurrencyVND` gọi `Math.round(amount)` trên một string, cho kết quả `NaN`.
- Đây chính là lý do Chương 2 nhấn mạnh: unit test nhanh và cô lập nhưng **không đảm bảo các phần
  ăn khớp với nhau** — cần integration test để bắt lỗi đó.
