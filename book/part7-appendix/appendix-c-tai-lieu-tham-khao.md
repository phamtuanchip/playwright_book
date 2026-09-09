# Phụ lục C: Tài liệu tham khảo & cộng đồng

## Tài liệu chính thức

| Công cụ | Tài liệu |
|---|---|
| Playwright | playwright.dev — tài liệu chính, luôn cập nhật theo phiên bản mới nhất |
| Playwright Test API reference | playwright.dev/docs/api/class-test — tra cứu mọi fixture, matcher |
| `@playwright/mcp` | github.com/microsoft/playwright-mcp — Playwright MCP server chính thức (Chương 28) |
| Model Context Protocol | modelcontextprotocol.io — đặc tả giao thức MCP, SDK chính thức (Chương 27) |
| Allure Report | allurereport.org — tài liệu Allure CLI, tích hợp với nhiều framework (Chương 18) |
| Express | expressjs.com — framework dùng cho `demo-app` trong sách |

## Từ cuốn sách này

Toàn bộ code mẫu trong sách nằm ở `code/` — mỗi thư mục có `README.md` riêng, giải thích cách chạy
và vai trò từng file:

- `code/ch01-sdlc/`, `ch02-.../` … `ch06-.../` — ví dụ Phần I-II (test case, ROI calculator, POM
  đối chiếu tốt/xấu).
- `code/demo-app/` — web app mẫu dùng xuyên suốt Phần IV-VI.
- `code/playwright-tests/` — project Playwright chính, 30 chương test tích lũy.
- `code/component-testing/` — ví dụ component testing (Chương 25).
- `code/mcp-basics/`, `code/playwright-mcp-demo/` — ví dụ MCP (Chương 27-29).

## Cộng đồng & nơi hỏi đáp

- **Playwright Discord** — cộng đồng chính thức, phản hồi nhanh cho câu hỏi kỹ thuật.
- **GitHub Discussions** của `microsoft/playwright` — tìm kiếm vấn đề đã có người gặp trước.
- **Stack Overflow**, tag `playwright` — lượng câu hỏi/đáp lớn, nhiều tình huống thực tế.

## Gợi ý học tiếp sau khi đọc xong sách

1. **Đọc changelog Playwright** mỗi khi có phiên bản mới — framework cập nhật khá nhanh, API mới
   (như `browser_snapshot`-style tooling ở Chương 28) xuất hiện đều đặn.
2. **Thử áp dụng lên một dự án thật** của bạn — chuyển toàn bộ demo-app trong sách thành nền tảng
   để thực hành trên ứng dụng thực tế bạn đang làm việc.
3. **Tìm hiểu sâu hơn về Docker cho visual testing** (đã nhắc ở Chương 21) — cần thiết khi triển
   khai visual testing thật trong CI đa hệ điều hành.
4. **Theo dõi sự phát triển của MCP** — giao thức còn mới, nhiều tool/agent hỗ trợ đang được thêm
   liên tục; kiến thức nền tảng ở Phần VI sẽ giúp bạn thích nghi nhanh với thay đổi.

## Lời kết

Cảm ơn bạn đã theo hết 30 chương. Cuốn sách này được viết với một nguyên tắc xuyên suốt: **mọi
ví dụ đều chạy được thật**, không có đoạn code minh hoạ nào chỉ tồn tại trên giấy. Hy vọng cách
tiếp cận đó giúp bạn tự tin áp dụng automation testing vào công việc thực tế — không chỉ hiểu lý
thuyết, mà biết chính xác nó hoạt động (và đôi khi thất bại) ra sao trong thực tế.
