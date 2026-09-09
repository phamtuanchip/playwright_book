# playwright-mcp-demo — Ví dụ Chương 28-29

Điều khiển trình duyệt thật thông qua **Playwright MCP server chính thức**
(`@playwright/mcp`) — không gọi một dòng Playwright API nào trực tiếp, mọi thao tác đi qua tool
MCP (`browser_navigate`, `browser_type`, `browser_click`, `browser_snapshot`...).

## Chạy thử

```bash
# 1. Khởi động demo-app ở terminal khác (bắt buộc phải chạy trước)
cd ../demo-app && npm start

# 2. Ở terminal này:
npm install
npm run list-tools   # xem toàn bộ tool Playwright MCP server expose
npm run demo          # đăng nhập vào demo-app HOÀN TOÀN qua MCP tool calls
npm run generate -- http://localhost:3000/login   # sinh khung test từ accessibility snapshot (Chương 29)
```

Output thật khi chạy `npm run demo` (đã kiểm chứng khi viết chương):

```
1) Điều hướng tới /login...
2) Điền email...
3) Điền mật khẩu...
4) Click nút Đăng nhập...
5) Chụp accessibility snapshot để xác nhận kết quả...

=== Kết quả ===
✓ Đăng nhập THÀNH CÔNG qua MCP — thấy 'demo@example.com' trong snapshot.
```

## Các file

- `list-tools.js` — kết nối tới `@playwright/mcp`, in ra toàn bộ tool nó expose.
- `demo.js` — kịch bản "agent" tự đăng nhập vào demo-app qua các tool đó, tự xác minh kết quả.
- `generate-test-skeleton.js` — quét accessibility snapshot của một URL, sinh khung test
  Playwright bằng heuristic (KHÔNG gọi LLM thật — xem Chương 29 để hiểu ranh giới với AI thật).
- `example-generated-login.spec.ts` — kết quả THẬT của `npm run generate` chạy trên `/login`,
  giữ lại làm ví dụ tham khảo (không phải file được generate lại mỗi lần chạy).
