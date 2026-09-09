# Playwright Book — Kế hoạch biên soạn sách

Sách automation testing với Playwright bằng tiếng Việt, dành cho người đã biết lập trình JS cơ
bản, đi từ khái niệm QA nền tảng trong SDLC đến làm chủ Playwright toàn diện, và mở rộng sang
AI + MCP/Browser automation. Mỗi chương kèm ví dụ/code mẫu chạy được.

> **Trạng thái: đang viết — Chương 14/33 đã hoàn thành, đã có bản HTML build được.**
> Xem `dist/index.html` để đọc bản HTML (chạy `npm install && npm run build` để tự build từ
> nguồn Markdown). Còn lại: 32 chương + PDF + EPUB.

## 1. Mục tiêu & đối tượng độc giả

- Dạy automation testing bằng Playwright từ cơ bản đến nâng cao.
- Mỗi chương có ví dụ code mẫu, và code đó được lưu trên repo (chạy được, không phải snippet rời rạc).
- Xuất bản dạng "release" — chất lượng đủ để công bố công khai kèm code kèm theo.
- Định dạng phát hành: **HTML** trước (ưu tiên, cập nhật liên tục), **PDF** và **EPUB** sau — chỉ
  build khi toàn bộ nội dung đã hoàn thiện & review.
- Đối tượng: đã biết lập trình JavaScript cơ bản, **chưa có** (hoặc rất ít) kiến thức về
  QA/kiểm thử phần mềm — không giả định biết trước Selenium/Cypress hay framework test nào khác.

## 2. Nguyên tắc biên soạn (mỗi chương)

1. Mục tiêu học (đọc xong làm được gì).
2. Khái niệm/lý thuyết nền, giải thích ngắn gọn, có sơ đồ (Mermaid) nếu cần.
3. Ví dụ/code mẫu từng bước, giải thích tại sao — không chỉ liệt kê code.
4. Ví dụ/project mẫu hoàn chỉnh trong `code/`, chạy được trực tiếp.
5. Bài tập cuối chương.
6. Lỗi thường gặp + cách khắc phục.
7. Tóm tắt & liên kết với chương tiếp theo.

Ghi chú: các chương thuần khái niệm (Phần I–II, chưa động tới Playwright) dùng artifact QA thật
(test case, test plan...) làm "ví dụ mẫu" thay cho code lập trình — xem Chương 1 làm mẫu.

Code mẫu Playwright (từ Phần IV trở đi) dùng TypeScript (mặc định của Playwright Test), có ghi
chú tương đương JavaScript khi cần. Một demo app xuyên suốt sách (giới thiệu ở Chương 9) được
dùng làm đối tượng test cho toàn bộ code mẫu từ Phần III trở đi.

## 3. Cấu trúc thư mục

```
playwright_book/
├── book/                      # Nội dung sách (Markdown), 1 file/chương + manifest.json (mục lục)
│   ├── manifest.json
│   ├── part1-qa-fundamentals/    # Chương 1-3
│   ├── part2-qa-roles/           # Chương 4-6
│   ├── part3-setup/              # Chương 7-9
│   ├── part4-playwright-basics/  # Chương 10-19
│   ├── part5-playwright-advanced/# Chương 20-26
│   ├── part6-ai-mcp/             # Chương 27-30
│   └── part7-appendix/           # Phụ lục A-C
├── code/                      # Ví dụ/code mẫu
│   ├── ch01-sdlc/, ch02-.../ ... ch06-.../   # Phần I-II: mỗi chương 1 thư mục độc lập
│   ├── playwright-tests/      # Phần IV-VI: MỘT project Playwright chung, xây dần qua chương
│   │                           # (tests/chXX-*.spec.ts) — xem lý do trong README của nó
│   └── demo-app/               # Web app mẫu (từ Chương 9), tests/ ở trên chạy nhằm vào đây
├── tools/                     # Script build HTML (tools/build.js) + CSS (tools/style.css)
├── dist/                      # HTML đã build (commit sẵn) — chạy `npm run build` để sinh lại
└── README.md                  # File kế hoạch này
```

Quy ước: mỗi chương gồm 1 file nội dung trong `book/<part>/chXX-slug.md` + (khi áp dụng) 1 thư
mục ví dụ/code trong `code/chXX-slug/`, có README riêng hướng dẫn dùng.

## 4. Mục lục sách

### Phần I — Nền tảng QA trong SDLC
1. ✅ SDLC là gì? Vị trí của kiểm thử (Testing) trong vòng đời phát triển phần mềm — [`book/part1-qa-fundamentals/ch01-sdlc.md`](book/part1-qa-fundamentals/ch01-sdlc.md) · ví dụ: [`code/ch01-sdlc/`](code/ch01-sdlc/)
2. ✅ Các loại kiểm thử: Manual vs Automation, Unit / Integration / E2E / Regression — [`book/part1-qa-fundamentals/ch02-loai-kiem-thu.md`](book/part1-qa-fundamentals/ch02-loai-kiem-thu.md) · ví dụ: [`code/ch02-loai-kiem-thu/`](code/ch02-loai-kiem-thu/)
3. ✅ Test case, test plan, bug report — những khái niệm cơ bản mọi QA cần biết — [`book/part1-qa-fundamentals/ch03-test-case-plan-bug.md`](book/part1-qa-fundamentals/ch03-test-case-plan-bug.md) · ví dụ: [`code/ch03-test-case-plan-bug/`](code/ch03-test-case-plan-bug/)

### Phần II — Vai trò QA & Automation QA
4. ✅ PQA (Product QA), FQA (Functional QA), TQA (Test/Technical QA) — phân biệt & trách nhiệm — [`book/part2-qa-roles/ch04-pqa-fqa-tqa.md`](book/part2-qa-roles/ch04-pqa-fqa-tqa.md) · ví dụ: [`code/ch04-pqa-fqa-tqa/`](code/ch04-pqa-fqa-tqa/)
5. ✅ Automation QA là gì? Khi nào nên tự động hoá, khi nào không — [`book/part2-qa-roles/ch05-automation-qa-la-gi.md`](book/part2-qa-roles/ch05-automation-qa-la-gi.md) · ví dụ: [`code/ch05-automation-qa-la-gi/`](code/ch05-automation-qa-la-gi/)
6. ✅ Kỹ năng & tư duy cần có của một Automation QA Engineer — [`book/part2-qa-roles/ch06-ky-nang-automation-qa.md`](book/part2-qa-roles/ch06-ky-nang-automation-qa.md) · ví dụ: [`code/ch06-ky-nang-automation-qa/`](code/ch06-ky-nang-automation-qa/)

### Phần III — Cài đặt môi trường
7. ✅ Cài đặt Node.js, quản lý package (npm/pnpm), VS Code & extension hữu ích — [`book/part3-setup/ch07-cai-dat-nodejs.md`](book/part3-setup/ch07-cai-dat-nodejs.md)
8. ✅ Khởi tạo project Playwright (`npm init playwright@latest`), cấu trúc thư mục project — [`book/part3-setup/ch08-khoi-tao-project-playwright.md`](book/part3-setup/ch08-khoi-tao-project-playwright.md) · project: [`code/playwright-tests/`](code/playwright-tests/)
9. ✅ Giới thiệu demo app dùng xuyên suốt sách — [`book/part3-setup/ch09-demo-app.md`](book/part3-setup/ch09-demo-app.md) · app: [`code/demo-app/`](code/demo-app/)

### Phần IV — Playwright cơ bản
10. ✅ Playwright là gì? Kiến trúc, so sánh nhanh với Selenium/Cypress — [`book/part4-playwright-basics/ch10-playwright-la-gi.md`](book/part4-playwright-basics/ch10-playwright-la-gi.md)
11. ✅ Test đầu tiên: Locators, Actions, Assertions — [`book/part4-playwright-basics/ch11-locators-actions-assertions.md`](book/part4-playwright-basics/ch11-locators-actions-assertions.md) · code: [`code/playwright-tests/tests/ch11-login-test-cases.spec.ts`](code/playwright-tests/tests/ch11-login-test-cases.spec.ts)
12. ✅ Cấu trúc test: `test`, `describe`, hooks (`beforeEach`/`afterEach`) — [`book/part4-playwright-basics/ch12-cau-truc-test.md`](book/part4-playwright-basics/ch12-cau-truc-test.md) · code: [`code/playwright-tests/tests/ch12-cau-truc-test.spec.ts`](code/playwright-tests/tests/ch12-cau-truc-test.spec.ts)
13. ✅ Làm việc với form, input, dropdown, upload file — [`book/part4-playwright-basics/ch13-form-input-upload.md`](book/part4-playwright-basics/ch13-form-input-upload.md) · code: [`code/playwright-tests/tests/ch13-form-input-upload.spec.ts`](code/playwright-tests/tests/ch13-form-input-upload.spec.ts)
14. ✅ Auto-waiting, xử lý bất đồng bộ, network — [`book/part4-playwright-basics/ch14-auto-waiting-network.md`](book/part4-playwright-basics/ch14-auto-waiting-network.md) · code: [`code/playwright-tests/tests/ch14-auto-waiting-network.spec.ts`](code/playwright-tests/tests/ch14-auto-waiting-network.spec.ts)
15. Page Object Model (POM) — tổ chức code test dễ bảo trì
16. Fixtures cơ bản, tái sử dụng logic test
17. Debug: Trace Viewer, UI Mode, `--debug`, codegen
18. Reporting: HTML reporter, tích hợp Allure
19. CI/CD: chạy Playwright trên GitHub Actions

### Phần V — Playwright nâng cao
20. API testing với `request` context (kết hợp UI + API test)
21. Visual testing / so sánh screenshot
22. Authentication & storage state (test app có đăng nhập)
23. Chạy song song, sharding, tối ưu tốc độ test suite
24. Cross-browser testing & mobile emulation
25. Component testing với Playwright
26. Custom fixtures nâng cao, viết plugin/reporter riêng

### Phần VI — Nâng cao: AI + MCP / Browser Automation
27. Model Context Protocol (MCP) là gì, vì sao liên quan đến automation test
28. Playwright MCP server — để AI agent điều khiển trình duyệt
29. Kết hợp AI sinh test case, self-healing test khi UI thay đổi
30. Case study thực tế: xây pipeline test bán tự động với AI + Playwright

### Phụ lục
- A. Best practices & checklist automation test
- B. Các lỗi thường gặp và cách xử lý (troubleshooting)
- C. Tài liệu tham khảo & cộng đồng

## 5. Pipeline xuất bản (HTML → PDF → EPUB)

**Đã chốt và hoạt động cho HTML**: script Node.js tự viết (`tools/build.js`, dùng `markdown-it`),
copy/thích ứng từ project sách Android tham khảo (`android_book`) — thay vì Quarto/Honkit/Pandoc,
để có toàn quyền tuỳ biến hiển thị (sidebar, sơ đồ Mermaid pan/zoom, syntax highlight) và tái sử
dụng đúng pipeline đã kiểm chứng.

- `npm run build` đọc `book/manifest.json` + từng file `book/<part>/chXX-*.md`, sinh HTML đầy đủ
  vào `dist/` (sidebar điều hướng, prev/next, syntax highlight bằng highlight.js, sơ đồ Mermaid có
  zoom/pan). Chương chưa viết hiển thị "đang được biên soạn" thay vì lỗi build.
- **PDF/EPUB**: chưa làm — theo đúng thứ tự ưu tiên đã chốt, chỉ build sau khi toàn bộ 33
  chương đã viết xong và review. Khi tới lúc, tái sử dụng `tools/build-pdf.js` của `android_book`
  (Puppeteer render HTML → in PDF) làm mẫu, không viết lại nội dung.

## 6. Tiến độ (progress tracker)

- [x] Chốt mục lục chi tiết
- [x] Dựng khung project (`book/`, `code/`, `tools/build.js`, `package.json`) + build HTML lần đầu
- [x] Viết xong Phần I (Chương 1–3: SDLC, các loại kiểm thử, test case/plan/bug report) + ví dụ
- [x] Viết xong Phần II (Chương 4–6: PQA/FQA/TQA, automation QA, kỹ năng) + ví dụ
- [x] Viết xong Phần III (Chương 7–9: cài đặt, khởi tạo project Playwright, demo app) + code chạy được
- [ ] Viết Phần IV (Playwright cơ bản, Chương 10–19)
- [ ] Viết Phần V (Playwright nâng cao, Chương 20–26)
- [ ] Viết Phần VI (AI/MCP, Chương 27–30)
- [ ] Viết Phụ lục A–C
- [ ] Review toàn bộ nội dung
- [ ] Build bản PDF
- [ ] Build bản EPUB

## 7. Các quyết định đã chốt trong quá trình viết

- **Công cụ build tài liệu**: script Node.js tự viết (`tools/build.js`), không dùng Quarto/Honkit —
  đổi từ đề xuất ban đầu (Quarto) sang phương án này để dùng chung pipeline đã kiểm chứng với sách
  Android tham khảo, tránh học lại công cụ mới.
- **Ngôn ngữ code mẫu Playwright**: TypeScript, từ Chương 10 trở đi.
- **Ví dụ cho chương thuần khái niệm**: dùng artifact QA thật (test case, test plan...) thay code —
  xem `code/ch01-sdlc/`.
- **Một project Playwright chung cho Phần IV-VI** (`code/playwright-tests/`), không tách mỗi chương
  một project riêng như Phần I-II — vì các test đều nhằm vào cùng một demo app (`code/demo-app/`)
  và kỹ thuật học chương trước (POM, fixtures...) được tái sử dụng ở chương sau, đúng cách một
  project Playwright thật vận hành. Xem lý do đầy đủ trong README của `code/playwright-tests/`.
