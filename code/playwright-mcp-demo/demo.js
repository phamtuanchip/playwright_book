import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Kịch bản: một "AI agent" (ở đây là script Node.js đóng vai agent) tự điều khiển trình
// duyệt qua Playwright MCP server để đăng nhập vào demo-app — KHÔNG có một dòng Playwright
// API nào được gọi trực tiếp; mọi thao tác đi qua tool MCP (browser_navigate/type/click).
// Yêu cầu: demo-app đang chạy ở http://localhost:3000 (npm start trong code/demo-app/).

const transport = new StdioClientTransport({
  command: "npx",
  args: ["@playwright/mcp", "--headless"],
});
const client = new Client({ name: "book-demo-agent", version: "1.0.0" });
await client.connect(transport);

async function callTool(name, args) {
  const result = await client.callTool({ name, arguments: args });
  return result.content.map((c) => c.text).join("\n");
}

console.log("1) Điều hướng tới /login...");
await callTool("browser_navigate", { url: "http://localhost:3000/login" });

console.log("2) Điền email...");
await callTool("browser_type", { target: "#email", text: "demo@example.com" });

console.log("3) Điền mật khẩu...");
await callTool("browser_type", { target: "#password", text: "Password123!" });

console.log("4) Click nút Đăng nhập...");
await callTool("browser_click", { target: "#submit-btn" });

console.log("5) Chụp accessibility snapshot để xác nhận kết quả...");
const snapshot = await callTool("browser_snapshot", {});
const loggedIn = snapshot.includes("demo@example.com");

console.log("\n=== Kết quả ===");
console.log(loggedIn ? "✓ Đăng nhập THÀNH CÔNG qua MCP — thấy 'demo@example.com' trong snapshot." : "✗ KHÔNG thấy dấu hiệu đăng nhập thành công.");

await client.close();
process.exit(loggedIn ? 0 : 1);
