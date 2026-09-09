"use strict";

// UNIT TEST: mỗi test chỉ gọi MỘT hàm, cô lập hoàn toàn khỏi các hàm khác trong
// cart.js. Đây là đặc điểm phân biệt unit test với integration test (xem
// integration-test.js) — chạy: node unit-test.js

const assert = require("node:assert");
const { calculateSubtotal, applyDiscount, formatCurrencyVND } = require("./cart");

function testCalculateSubtotal() {
  const result = calculateSubtotal([
    { price: 100000, qty: 2 },
    { price: 50000, qty: 1 },
  ]);
  assert.strictEqual(result, 250000, "Tổng tiền hàng phải là 250,000");
}

function testCalculateSubtotal_gioHangRong() {
  const result = calculateSubtotal([]);
  assert.strictEqual(result, 0, "Giỏ hàng rỗng phải trả về 0");
}

function testApplyDiscount() {
  const result = applyDiscount(200000, 10);
  assert.strictEqual(result, 180000, "Giảm 10% trên 200,000 phải còn 180,000");
}

function testApplyDiscount_khongHopLe() {
  assert.throws(
    () => applyDiscount(100000, 150),
    /0-100/,
    "discountPercent > 100 phải ném lỗi"
  );
}

function testFormatCurrencyVND() {
  assert.strictEqual(formatCurrencyVND(180000), "180.000 đ");
}

const tests = [
  testCalculateSubtotal,
  testCalculateSubtotal_gioHangRong,
  testApplyDiscount,
  testApplyDiscount_khongHopLe,
  testFormatCurrencyVND,
];

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
console.log(`\nUnit test: ${passed}/${tests.length} passed`);
process.exit(passed === tests.length ? 0 : 1);
