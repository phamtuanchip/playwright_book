"use strict";

// Reporter tuỳ biến (Chương 26) — implement giao diện Reporter của Playwright:
// https://playwright.dev/docs/test-reporters#custom-reporters
// Chỉ cần một class có (một phần) các phương thức onBegin/onTestEnd/onEnd — không cần cài
// thêm package nào, không cần extends class nào cả.

class SimpleReporter {
  onBegin(config, suite) {
    this.startTime = Date.now();
    this.total = suite.allTests().length;
    console.log(`\n[SimpleReporter] Bắt đầu chạy ${this.total} test...`);
  }

  onTestEnd(test, result) {
    const icon = result.status === "passed" ? "✓" : result.status === "skipped" ? "○" : "✗";
    console.log(`[SimpleReporter] ${icon} ${test.title} (${result.duration}ms)`);
  }

  onEnd(result) {
    const seconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[SimpleReporter] Xong: ${result.status} — chạy trong ${seconds}s\n`);
  }
}

module.exports = SimpleReporter;
