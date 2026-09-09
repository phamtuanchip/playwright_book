"use strict";

// Module nghiệp vụ nhỏ dùng để minh hoạ 3 cấp độ test trong Chương 2:
// unit-test.js test từng hàm riêng lẻ, integration-test.js test cả 3 hàm
// phối hợp với nhau qua calculateTotal().

function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function applyDiscount(subtotal, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("discountPercent phải trong khoảng 0-100");
  }
  return subtotal - (subtotal * discountPercent) / 100;
}

function formatCurrencyVND(amount) {
  return Math.round(amount).toLocaleString("vi-VN") + " đ";
}

function calculateTotal(items, discountPercent = 0) {
  const subtotal = calculateSubtotal(items);
  const afterDiscount = applyDiscount(subtotal, discountPercent);
  return formatCurrencyVND(afterDiscount);
}

module.exports = { calculateSubtotal, applyDiscount, formatCurrencyVND, calculateTotal };
