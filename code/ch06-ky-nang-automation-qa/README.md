# Ví dụ Chương 6 — "Trước/Sau": tư duy Automation QA thể hiện qua code

Hai file cùng test một kịch bản (đăng nhập, TC-01/TC-02 ở Chương 1), viết theo hai tư duy khác
nhau, để thấy "kỹ năng automation QA" cụ thể là gì chứ không chỉ là khái niệm trừu tượng:

- [`bad-example.spec.ts`](./bad-example.spec.ts) — cách viết phổ biến của người mới, có 5 vấn đề
  được đánh số và giải thích ngay trong comment.
- [`good-example.spec.ts`](./good-example.spec.ts) — cùng kịch bản, mỗi "Sửa N" đối ứng trực tiếp
  với "Vấn đề N" ở file kia.

## Vì sao chưa chạy được ngay?

Cả hai file dùng cú pháp Playwright thật, nhưng project chưa cài Playwright (sẽ làm ở Chương 7-8)
và cú pháp đầy đủ (locators, fixtures, POM) mới học chi tiết ở Phần IV (Chương 11-16). Đọc hai file
này ở Chương 6 với mục đích **nhận diện tư duy tốt/xấu**, chưa cần chạy — khi tới Chương 11, bạn sẽ
quay lại tinh chỉnh và chạy thật hai file này.

## Bảng đối chiếu nhanh

| # | Vấn đề (bad-example) | Cách sửa (good-example) |
|---|---|---|
| 1 | `waitForTimeout()` — chờ mù, đoán thời gian | `expect()` tự động chờ đến khi đúng điều kiện |
| 2 | Locator theo cấu trúc DOM (`nth-child`, class CSS) | Locator theo vai trò/nhãn người dùng thấy (`getByLabel`, `getByRole`) |
| 3 | Assertion mơ hồ (`toBeTruthy()`) | Assertion cụ thể, khớp đúng "Kết quả mong đợi" trong test case |
| 4 | Lặp lại logic đăng nhập ở mọi test | Tách thành hàm `login()` dùng chung |
| 5 | Test phụ thuộc thứ tự chạy (session rò rỉ) | Mỗi test độc lập, browser context riêng |
