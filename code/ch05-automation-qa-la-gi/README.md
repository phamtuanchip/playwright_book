# Ví dụ Chương 5 — Công cụ tính ROI của Automation Test

`roi-calculator.js` trả lời câu hỏi cốt lõi của Chương 5 bằng số liệu cụ thể thay vì cảm tính: so
sánh tổng chi phí (thời gian) của manual testing so với automation testing qua N lần chạy lại.

## Chạy thử

```bash
node roi-calculator.js
```

## Hai case đối lập trong output

1. **Test case chạy trong mọi CI build** (~200 lần/năm) — automation hoà vốn rất nhanh (lần chạy
   thứ 50) → **nên** tự động hoá.
2. **Luồng nghiệp vụ hiếm gặp** (~2 lần/năm) — chi phí viết + bảo trì automation còn cao hơn hẳn
   chi phí test tay 2 lần → **chưa nên** tự động hoá, ít nhất là chưa cần ưu tiên ngay.

## Tự thử với case của bạn

Sửa các tham số trong lệnh gọi `printReport(...)` ở cuối file — đổi `manualMinutesPerRun`,
`automationHoursToWrite`, `numberOfRuns`... theo một tính năng thật bạn đang làm, để tự trả lời
câu hỏi "test case này có đáng tự động hoá không?".
