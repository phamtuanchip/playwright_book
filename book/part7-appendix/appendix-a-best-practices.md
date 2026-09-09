# Phụ lục A: Best practices & checklist automation test

Bảng tổng hợp các nguyên tắc đã học xuyên suốt sách, tổ chức theo checklist thực dụng — dùng để tự
rà soát trước khi coi một automation test (hoặc cả suite) là "xong".

## Checklist khi viết một test case mới

- [ ] **Test case có "Kết quả mong đợi" cụ thể, đo lường được** trước khi viết code — không viết
      code test khi chưa rõ ràng cái gì là "đúng" (Chương 3).
- [ ] **Locator ưu tiên theo `getByRole`/`getByLabel`/`getByText`**, chỉ dùng CSS/XPath khi không
      còn lựa chọn nào tốt hơn (Chương 6, 11).
- [ ] **Không có `waitForTimeout`** — dựa vào auto-waiting của action/assertion; nếu cần chờ một
      network request cụ thể, dùng `waitForResponse` (Chương 14).
- [ ] **Assertion khớp chính xác với "Kết quả mong đợi"** trong test case gốc — không chỉ kiểm tra
      "có gì đó xảy ra" (Chương 6, 11).
- [ ] **Test độc lập hoàn toàn** — không phụ thuộc thứ tự chạy, không để lại trạng thái ảnh hưởng
      test khác (Chương 6, 11).
- [ ] **Dữ liệu test được seed/reset rõ ràng** (qua API test-only, hoặc `beforeEach`) — không dựa
      vào trạng thái "may rủi" còn lại từ lần chạy trước (Chương 1, 22).

## Checklist khi tổ chức test lớn hơn

- [ ] **Logic dùng chung được tách vào Page Object** khi nhiều test cùng dùng một trang
      (Chương 15).
- [ ] **Setup/teardown lặp lại được tách vào fixture**, không lặp lại trong từng `beforeEach`
      (Chương 16).
- [ ] **Dữ liệu mutable (tài khoản, trạng thái) không dùng chung giữa test chạy song song** — mỗi
      worker seed dữ liệu riêng nếu cần chạy song song an toàn (Chương 23).
- [ ] **`test.step()`** cho test dài, nhiều bước — dễ đọc trace/report khi fail (Chương 12).

## Checklist trước khi đưa vào CI/CD

- [ ] **`npm ci` chạy sạch** (không chỉ `npm install`) từ lockfile, xác nhận đúng phiên bản
      dependency (Chương 19).
- [ ] **`forbidOnly: true` trên CI** — chặn `test.only()` sót lại làm CI bỏ qua test khác
      (Chương 19).
- [ ] **`retries` chỉ bật trên CI**, không bật khi dev cục bộ (Chương 19).
- [ ] **Artifact (report, trace) được upload** dù test pass hay fail (`if: always()`) — luôn có
      dữ liệu để debug khi CI fail (Chương 19).
- [ ] **Visual test snapshot tạo trên đúng môi trường CI** (Docker, hoặc trực tiếp trên CI), không
      tạo trên máy dev rồi commit thẳng (Chương 21).

## Checklist về tư duy (không phải cấu hình)

- [ ] **Không phải mọi test case đều nên tự động hoá** — cân nhắc tần suất chạy lại, độ ổn định
      (Chương 5).
- [ ] **Code sinh ra từ `codegen`/AI/heuristic luôn cần review**, không phải sản phẩm cuối
      (Chương 17, 29).
- [ ] **Khi test fail, đọc kỹ thông báo lỗi trước khi kết luận** — nhiều khi test đang "làm đúng
      việc của nó": phát hiện vấn đề thật (Chương 9, 14).
- [ ] **Automation test không thay thế Manual/Exploratory testing** — bổ trợ cho nhau, không chọn
      một bỏ một (Chương 2).

## Tham khảo nhanh: nguyên tắc "5 điều kiện auto-waiting"

Trước khi thực hiện action, Playwright chờ phần tử: (1) attached vào DOM, (2) visible, (3) stable
(không đang animation), (4) receives events (không bị đè), (5) không disabled. Hiểu 5 điều kiện
này giúp debug nhanh hơn khi một action bị timeout (Chương 14).
