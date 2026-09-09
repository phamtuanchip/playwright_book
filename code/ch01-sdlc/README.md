# Ví dụ Chương 1 — SDLC

Ví dụ minh hoạ cho Chương 1 không phải code lập trình (chương này thuần khái niệm), mà là một
**artifact thật của QA**: bộ test case cho tính năng "Đăng nhập" được nhắc tới xuyên suốt chương.

- [`test-case-list-login.md`](./test-case-list-login.md) — bộ test case hoàn chỉnh, viết theo
  đúng format QA dùng trong công việc thực tế (ID, tiền điều kiện, các bước, kết quả mong đợi).

Bộ test case này chính là "cầu nối" giữa Phần I (khái niệm QA) và Phần IV (automation test bằng
Playwright): mỗi test case ở đây sẽ được hiện thực lại thành một test Playwright thật trong
Chương 11 (`code/ch11-locators-actions-assertions/`), dùng cùng một demo app (giới thiệu ở
Chương 9).
