"use strict";

// Công cụ nhỏ trả lời câu hỏi cốt lõi của Chương 5: "test case này có ĐÁNG để tự động hoá
// không?" — bằng cách so sánh chi phí tích luỹ của manual testing so với automation testing
// qua N chu kỳ regression. Chạy: node roi-calculator.js

/**
 * @param {number} manualMinutesPerRun  Thời gian test tay 1 lần (phút)
 * @param {number} automationHoursToWrite  Thời gian viết + review automation test (giờ)
 * @param {number} automationMinutesPerRun  Thời gian automation TỰ chạy 1 lần (phút, ~0 công sức người)
 * @param {number} maintenanceMinutesPerRun  Thời gian trung bình bảo trì test/lần chạy (do UI đổi, flaky...)
 * @param {number} numberOfRuns  Số lần dự kiến sẽ chạy lại (regression) trong vòng đời tính năng
 */
function compareCost({
  manualMinutesPerRun,
  automationHoursToWrite,
  automationMinutesPerRun,
  maintenanceMinutesPerRun,
  numberOfRuns,
}) {
  const manualTotalMinutes = manualMinutesPerRun * numberOfRuns;

  const automationSetupMinutes = automationHoursToWrite * 60;
  const automationRunMinutes = automationMinutesPerRun * numberOfRuns;
  const automationMaintenanceMinutes = maintenanceMinutesPerRun * numberOfRuns;
  const automationTotalMinutes =
    automationSetupMinutes + automationRunMinutes + automationMaintenanceMinutes;

  const breakEvenRun = Math.ceil(
    automationSetupMinutes / (manualMinutesPerRun - automationMinutesPerRun - maintenanceMinutesPerRun)
  );

  return {
    manualTotalMinutes,
    automationTotalMinutes,
    worthAutomating: automationTotalMinutes < manualTotalMinutes,
    breakEvenRun, // sau bao nhiêu lần chạy thì automation bắt đầu "lời" so với manual
  };
}

function printReport(title, input) {
  const result = compareCost(input);
  console.log(`\n=== ${title} ===`);
  console.log(`Số lần chạy dự kiến: ${input.numberOfRuns}`);
  console.log(`Tổng chi phí manual:     ${result.manualTotalMinutes} phút`);
  console.log(`Tổng chi phí automation: ${result.automationTotalMinutes} phút`);
  console.log(
    result.worthAutomating
      ? `=> NÊN tự động hoá (hoà vốn sau lần chạy thứ ${result.breakEvenRun})`
      : `=> CHƯA nên tự động hoá (chi phí automation vẫn cao hơn manual ở số lần chạy này)`
  );
}

// Case 1: test case chạy trong mọi CI build (regression suite) — chạy rất nhiều lần.
printReport("TC-01: Đăng nhập thành công (chạy mỗi lần CI, ~200 lần/năm)", {
  manualMinutesPerRun: 3,
  automationHoursToWrite: 2,
  automationMinutesPerRun: 0.1,
  maintenanceMinutesPerRun: 0.5,
  numberOfRuns: 200,
});

// Case 2: test case rất hiếm khi cần chạy lại (ví dụ luồng import dữ liệu 1 lần/năm cho khách VIP).
printReport("Luồng nghiệp vụ hiếm gặp (chạy ~2 lần/năm, chỉ 1 khách hàng dùng)", {
  manualMinutesPerRun: 5,
  automationHoursToWrite: 4,
  automationMinutesPerRun: 0.2,
  maintenanceMinutesPerRun: 1,
  numberOfRuns: 2,
});

module.exports = { compareCost };
