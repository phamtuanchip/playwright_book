# Chương 28: Playwright MCP server — để AI agent điều khiển trình duyệt

## Mục tiêu học

- Cài đặt và khám phá tool của Playwright MCP server chính thức (`@playwright/mcp`).
- Hiểu cách một AI agent điều khiển trình duyệt qua MCP — khác gọi Playwright API trực tiếp
  (Chương 11-26) ở điểm nào.
- Tự viết một script "đóng vai agent", điều khiển demo-app hoàn toàn qua MCP tool calls.

> Code mẫu: `code/playwright-mcp-demo/` — đã kiểm chứng thật: đăng nhập thành công vào demo-app
> chỉ bằng cách gọi tool MCP, không có dòng Playwright API nào được gọi trực tiếp.

## 28.1. Playwright MCP server là gì?

**`@playwright/mcp`** (do Microsoft phát triển, cùng đội ngũ Playwright) là một MCP server (nhắc
lại kiến trúc ở Chương 27) expose các **tool điều khiển trình duyệt** — thay vì AI agent phải tự
viết code Playwright, nó chỉ cần **gọi tool** như "mở URL", "click vào phần tử", "gõ text".

```bash
npm install @playwright/mcp @modelcontextprotocol/sdk
```

Chạy `list-tools.js` (`code/playwright-mcp-demo/`) để tự khám phá — kết quả thật khi viết chương
này có **hơn 20 tool**, một số quan trọng nhất:

| Tool | Vai trò |
|---|---|
| `browser_navigate` | Điều hướng tới một URL |
| `browser_snapshot` | Chụp **accessibility snapshot** (không phải ảnh — cây cấu trúc phần tử) |
| `browser_click` | Click vào phần tử |
| `browser_type` | Gõ text vào phần tử |
| `browser_take_screenshot` | Chụp ảnh màn hình (chỉ để xem, không dùng để xác định phần tử) |
| `browser_network_requests` | Xem danh sách network request đã xảy ra |

## 28.2. Vì sao `browser_snapshot`, không phải ảnh chụp màn hình?

Đây là điểm thiết kế quan trọng: AI agent **không "nhìn" màn hình như con người** để tìm phần tử
— nó đọc **accessibility snapshot**, một cây cấu trúc text mô tả từng phần tử (vai trò, tên, giá
trị) — chính là dữ liệu mà `getByRole`/`getByLabel` (Chương 11) cũng dựa vào. Đây là lý do tư duy
chọn locator tốt (Chương 6, 11) — dùng role/label rõ ràng — cũng trực tiếp giúp AI agent "thấy"
đúng phần tử cần thao tác.

## 28.3. Tự viết một "agent" điều khiển demo-app qua MCP

```js
// demo.js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({ command: "npx", args: ["@playwright/mcp", "--headless"] });
const client = new Client({ name: "book-demo-agent", version: "1.0.0" });
await client.connect(transport);

async function callTool(name, args) {
  const result = await client.callTool({ name, arguments: args });
  return result.content.map((c) => c.text).join("\n");
}

await callTool("browser_navigate", { url: "http://localhost:3000/login" });
await callTool("browser_type", { target: "#email", text: "demo@example.com" });
await callTool("browser_type", { target: "#password", text: "Password123!" });
await callTool("browser_click", { target: "#submit-btn" });

const snapshot = await callTool("browser_snapshot", {});
console.log(snapshot.includes("demo@example.com") ? "Đăng nhập thành công!" : "Thất bại.");
```

Chạy thật (yêu cầu `demo-app` đang chạy ở terminal khác):

```bash
cd code/demo-app && npm start &     # terminal 1
cd code/playwright-mcp-demo && npm run demo   # terminal 2
```

Output thật:

```
✓ Đăng nhập THÀNH CÔNG qua MCP — thấy 'demo@example.com' trong snapshot.
```

**Không có một dòng `page.goto()`, `page.fill()`, hay `page.click()` nào trong `demo.js`** — mọi
thao tác đi qua tool MCP (`browser_navigate`, `browser_type`, `browser_click`). Tham số `target`
của các tool này nhận **CSS selector trực tiếp** (như `"#email"`) hoặc một tham chiếu lấy từ
`browser_snapshot` — linh hoạt hơn locator Playwright thông thường vì AI agent thường không biết
trước cấu trúc trang, cần tự khám phá qua snapshot trước.

## 28.4. So sánh: viết test bằng Playwright API trực tiếp vs điều khiển qua MCP

| | Playwright API trực tiếp (Chương 11-26) | Điều khiển qua MCP (chương này) |
|---|---|---|
| Ai/cái gì gọi | Code test do người viết | AI agent (hoặc script mô phỏng agent) |
| Biết trước cấu trúc trang? | Có — người viết code đã xem trang, chọn locator cụ thể | Không nhất thiết — agent tự khám phá qua `browser_snapshot` |
| Phù hợp cho | Automation test cố định, chạy lại nhiều lần (regression) | Tác vụ một lần, thăm dò, hoặc để AI tự quyết định hành động tiếp theo |
| Ổn định/lặp lại | Rất cao (đã học kỹ locator ổn định — Chương 11) | Thấp hơn — phụ thuộc khả năng "hiểu" trang của AI ở mỗi lần chạy |

**Kết luận quan trọng:** MCP không thay thế automation test truyền thống (Chương 11-26) — nó phục
vụ mục đích khác: để AI agent **tự thực hiện tác vụ chưa biết trước**, hoặc **hỗ trợ sinh test
case** (Chương 29), không phải để chạy regression suite ổn định hàng ngày.

## Bài tập

1. Chạy `npm run list-tools` trong `code/playwright-mcp-demo/`, đọc mô tả của `browser_fill_form`
   — nó khác `browser_type` gọi nhiều lần ở điểm nào?
2. Chạy `npm run demo`, xác nhận output khớp như mục 28.3.
3. Sửa `demo.js` để thử đăng nhập với mật khẩu sai — dùng `browser_snapshot` để tìm và in ra đúng
   thông báo lỗi "Email hoặc mật khẩu không đúng" (TC-02, Chương 1).
4. Thử gọi `browser_navigate` tới `http://localhost:3000/orders` (chưa đăng nhập) — dùng
   `browser_snapshot` xác nhận agent "nhìn thấy" đúng việc đã bị chuyển về `/login` (TC-10).

## Lỗi thường gặp

- **Quên khởi động `demo-app` trước khi chạy `demo.js`**: `browser_navigate` sẽ thất bại vì không
  kết nối được tới `localhost:3000`.
- **Nhầm `browser_take_screenshot` dùng để xác định phần tử**: tool này chỉ để **xem**, không dùng
  để lấy `target` cho `browser_click`/`browser_type` — phải dùng `browser_snapshot`.
- **Kỳ vọng kết quả 100% ổn định như automation test truyền thống**: MCP phù hợp cho tác vụ AI tự
  quyết định, không nên dùng để thay thế regression suite đã xây từ Chương 11 — xem mục 28.4.

## Tóm tắt & tiếp theo

- Playwright MCP server expose tool điều khiển trình duyệt qua accessibility snapshot, không qua
  ảnh chụp màn hình.
- Đã tự viết và chạy được một "agent" điều khiển demo-app thật, hoàn toàn qua MCP tool calls.
- MCP phục vụ mục đích khác automation test truyền thống — bổ trợ, không thay thế Chương 11-26.

Chương 29 dùng chính khả năng "AI hiểu trang qua snapshot" vừa thấy ở chương này để hỗ trợ **sinh
test case** và tìm hiểu khái niệm self-healing test.
