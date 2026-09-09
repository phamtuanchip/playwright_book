# Ma trận trách nhiệm: PQA vs FQA vs TQA

Ví dụ áp dụng cho cùng tính năng "Đăng nhập" đã dùng xuyên suốt Phần I — với mỗi hoạt động, ai là
người chịu trách nhiệm chính (R), ai chỉ tham vấn/hỗ trợ (C)?

| Hoạt động | PQA (Product QA) | FQA (Functional QA) | TQA (Test/Technical QA — Automation) |
|---|---|---|---|
| Review yêu cầu nghiệp vụ ("đăng nhập sai 5 lần thì khoá") có hợp lý với người dùng thật không | **R** | C | — |
| Review UX form đăng nhập (thông báo lỗi có rõ ràng, thân thiện không) | **R** | C | — |
| Viết test case functional (TC-01 → TC-10 ở Chương 1) | C | **R** | C |
| Test tay (manual) từng test case trên build mới | — | **R** | — |
| Viết automation test bằng Playwright cho các test case trên | — | C | **R** |
| Dựng & bảo trì pipeline CI/CD chạy automation test | — | — | **R** |
| Phân tích kết quả test tự động thất bại: lỗi thật hay flaky test? | — | C | **R** |
| Quyết định tính năng đủ điều kiện release (dựa trên exit criteria trong test plan) | **R** | C | C |

**Cách đọc:** không phải công ty nào cũng có đủ 3 vai trò riêng biệt — ở công ty nhỏ, một người có
thể kiêm cả FQA và TQA (đây cũng chính là chân dung "Automation QA Engineer" nói ở Chương 5–6).
Điều quan trọng là hiểu **loại trách nhiệm nào thuộc về đâu**, không phải chức danh chính xác.
