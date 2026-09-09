# mcp-basics — Ví dụ Chương 27

MCP server + client **tối giản, chạy được thật** — minh hoạ đúng cơ chế mà một AI agent (Claude,
hoặc bất kỳ AI hỗ trợ MCP nào) dùng để "gọi công cụ": kết nối qua STDIO, liệt kê tool, gọi tool,
nhận kết quả dạng text.

Server expose 2 tool, cả hai đọc trực tiếp `code/ch01-sdlc/test-case-list-login.md` (bộ test case
Chương 1) — chọn dữ liệu này để tool "có ý nghĩa thật" trong ngữ cảnh sách, không phải ví dụ
"cộng hai số" trừu tượng.

## Chạy thử

```bash
npm install
npm run demo   # chạy client.js — tự khởi động server.js làm tiến trình con, gọi cả 2 tool
```

Output thật khi chạy (đã kiểm chứng khi viết chương):

```
=== 1. Danh sách tool mà server này cung cấp ===
- count_login_test_cases: ...
- get_test_case_detail: ...

=== 2. Gọi tool count_login_test_cases ===
Bộ test case đăng nhập (Chương 1) có 10 test case: TC-01, TC-02, ..., TC-10.

=== 3. Gọi tool get_test_case_detail cho TC-07 ===
| TC-07 | Khoá tài khoản sau 5 lần đăng nhập sai | ...
```

## Các file

- `server.js` — MCP server, expose `count_login_test_cases` và `get_test_case_detail`.
- `client.js` — MCP client, đóng vai một AI agent: kết nối, liệt kê tool, gọi tool.
