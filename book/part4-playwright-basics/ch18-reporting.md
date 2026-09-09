# Chương 18: Reporting — HTML reporter, tích hợp Allure

## Mục tiêu học

- Hiểu cấu trúc báo cáo HTML mặc định của Playwright, cách chia sẻ nó cho người khác.
- Cấu hình nhiều reporter cùng lúc.
- Tích hợp Allure — reporter phổ biến trong doanh nghiệp, phù hợp chia sẻ với người không đọc code
  (PM, PQA — nhắc lại Chương 4).

> Code mẫu: `playwright.config.ts` (cấu hình 2 reporter cùng lúc) — `code/playwright-tests/`.

## 18.1. HTML reporter — đã dùng từ Chương 9

Từ đầu sách, `playwright.config.ts` đã có `reporter: "html"`. Sau khi chạy `npm test`, mở báo cáo:

```bash
npm run report
```

Báo cáo HTML hiển thị: danh sách test theo file, pass/fail/skip, thời gian chạy từng test, và với
test fail — ảnh chụp màn hình, trace đính kèm trực tiếp (không cần mở riêng bằng `show-trace`).
Đây là báo cáo **tốt cho người viết test**, nhưng khá "kỹ thuật" — không phải lựa chọn tốt nhất khi
cần gửi báo cáo cho PM hoặc PQA không quen đọc log test.

## 18.2. Nhiều reporter cùng lúc

```ts
// playwright.config.ts
reporter: [["html"], ["allure-playwright"]],
```

Playwright cho phép khai báo **một danh sách reporter**, chạy song song — không phải chọn một
trong hai. Ở đây, `html` vẫn sinh báo cáo như cũ, đồng thời `allure-playwright` ghi thêm dữ liệu
thô vào thư mục `allure-results/` để xử lý ở bước tiếp theo.

## 18.3. Tích hợp Allure

**Allure** là công cụ báo cáo test phổ biến trong doanh nghiệp, không riêng gì Playwright (cũng
dùng được với JUnit, TestNG, Cypress...) — tạo báo cáo HTML đẹp, có thể nhóm test theo "feature",
gắn severity, lịch sử pass/fail qua nhiều lần chạy.

**Bước 1 — cài reporter (đã làm, chạy trong Node.js, không cần gì thêm):**

```bash
npm install -D allure-playwright
```

**Bước 2 — chạy test như thường:**

```bash
npm test
```

Sau bước này, `allure-results/` chứa các file `.json` thô (mỗi test 1 file `*-result.json`) — đây
là dữ liệu Allure cần, **đã sinh ra thành công chỉ với Node.js**, không cần công cụ nào khác.

**Bước 3 — sinh báo cáo HTML từ dữ liệu thô (cần cài thêm Allure CLI):**

```bash
npm run allure:generate   # allure generate allure-results --clean -o allure-report
npm run allure:open       # allure open allure-report
```

> **Lưu ý quan trọng:** hai lệnh ở Bước 3 cần **Allure CLI** đã cài sẵn trên máy (qua
> `npm install -g allure-commandline`, Homebrew/Scoop, hoặc tải trực tiếp) — và Allure CLI (bản
> phổ biến hiện tại) cần **Java Runtime (JRE)** để chạy. Đây là bước cài đặt **tách biệt** khỏi
> Node.js/npm, không tự động có sẵn dù bạn đã cài Playwright đầy đủ.

## 18.4. Vì sao tách riêng "sinh dữ liệu" và "sinh báo cáo"?

Đây là kiến trúc phổ biến trong hệ sinh thái Allure: `allure-playwright` (chạy trong Node.js) chỉ
làm nhiệm vụ **ghi lại dữ liệu thô** khi test chạy — nhẹ, không phụ thuộc Java. Việc **dựng** dữ
liệu đó thành trang HTML tương tác là công việc của Allure CLI (viết bằng Java) — tách riêng để
`allure-playwright` không phải kéo theo cả một JVM runtime vào mọi project Node.js chỉ để ghi log.

Trong CI/CD (Chương 19), bước cài Java + Allure CLI thường được thêm vào workflow như một bước
riêng, trước khi chạy `allure generate`.

## Bài tập

1. Chạy `npm test` trong `code/playwright-tests/`, xác nhận thư mục `allure-results/` được tạo ra
   với nhiều file `*-result.json` (một cho mỗi test).
2. Mở một file `.json` trong `allure-results/` bằng editor — tìm trường `status` và `name`, xác
   nhận nó khớp với một test bạn biết trong `tests/`.
3. Nếu máy bạn có Java: cài Allure CLI (`npm install -g allure-commandline` hoặc qua Homebrew/Scoop),
   chạy `npm run allure:generate && npm run allure:open`, xem báo cáo HTML thực sự sinh ra.
4. So sánh báo cáo HTML mặc định của Playwright (`npm run report`) với những gì bạn đọc được về
   Allure ở mục 18.3 — với đối tượng "PM không đọc code", báo cáo nào bạn sẽ chọn gửi, và vì sao?

## Lỗi thường gặp

- **Tưởng chỉ cần `npm install -D allure-playwright` là có báo cáo HTML Allure ngay**: package này
  chỉ sinh dữ liệu thô — cần thêm Allure CLI (và Java) mới ra được báo cáo HTML cuối cùng, xem mục
  18.3-18.4.
- **Commit `allure-results/`/`allure-report/` vào git**: đây là dữ liệu sinh ra từ mỗi lần chạy
  test, không nên commit — đã được thêm vào `.gitignore` cùng `test-results/`, `playwright-report/`.
- **Chạy `allure generate` nhiều lần mà không có `--clean`**: dữ liệu cũ và mới trộn lẫn trong
  `allure-report/`, gây hiểu sai lịch sử — script `allure:generate` trong `package.json` đã có sẵn
  cờ này.

## Tóm tắt & tiếp theo

- Playwright hỗ trợ khai báo nhiều reporter cùng lúc (`reporter: [[...], [...]]`).
- `allure-playwright` sinh dữ liệu thô chỉ cần Node.js; sinh báo cáo HTML cuối cùng cần Allure CLI
  (và Java) — hai bước tách biệt.
- Chọn reporter theo đối tượng nhận báo cáo: HTML mặc định cho người viết test, Allure cho việc
  chia sẻ rộng hơn (PM, PQA).

Chương 19 — chương cuối của Phần IV — tích hợp toàn bộ 31 test đã có vào một pipeline CI/CD thật
bằng GitHub Actions, chạy tự động mỗi khi có commit mới.
