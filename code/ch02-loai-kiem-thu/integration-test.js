"use strict";

// INTEGRATION TEST: gọi calculateTotal() — hàm này bên trong PHỐI HỢP cả 3 hàm
// calculateSubtotal + applyDiscount + formatCurrencyVND với nhau. Test này xác
// minh 3 hàm đó ăn khớp đúng khi ghép lại, điều mà unit-test.js (test riêng
// từng hàm) không phát hiện được — ví dụ nếu applyDiscount đổi kiểu trả về từ
// number sang string, từng unit test riêng vẫn pass nhưng calculateTotal sẽ vỡ.
// Chạy: node integration-test.js

const assert = require("node:assert");
const { calculateTotal } = require("./cart");

function testCalculateTotal_coGiamGia() {
  const result = calculateTotal(
    [
      { price: 150000, qty: 2 },
      { price: 100000, qty: 1 },
    ],
    10 // giảm 10%
  );
  // subtotal = 400,000 -> sau giảm 10% = 360,000
  assert.strictEqual(result, "360.000 đ");
}

function testCalculateTotal_khongGiamGia() {
  const result = calculateTotal([{ price: 99000, qty: 1 }]);
  assert.strictEqual(result, "99.000 đ");
}

const tests = [testCalculateTotal_coGiamGia, testCalculateTotal_khongGiamGia];

let passed = 0;
for (const test of tests) {
  try {
    test();
    passed++;
    console.log(`✓ ${test.name}`);
  } catch (err) {
    console.error(`✗ ${test.name}: ${err.message}`);
  }
}
console.log(`\nIntegration test: ${passed}/${tests.length} passed`);
process.exit(passed === tests.length ? 0 : 1);
