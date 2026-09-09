import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Client MCP tối giản (Chương 27) — đóng vai một "AI agent" thật (đây chính xác là cách
// Claude/các AI agent khác kết nối tới MCP server: qua Client + Transport, không có gì
// "ma thuật" khác biệt cả). Tự khởi động server.js làm tiến trình con qua STDIO.

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"],
});

const client = new Client({ name: "book-demo-mcp-client", version: "1.0.0" });
await client.connect(transport);

console.log("=== 1. Danh sách tool mà server này cung cấp ===");
const { tools } = await client.listTools();
for (const tool of tools) {
  console.log(`- ${tool.name}: ${tool.description}`);
}

console.log("\n=== 2. Gọi tool count_login_test_cases ===");
const countResult = await client.callTool({ name: "count_login_test_cases", arguments: {} });
console.log(countResult.content[0].text);

console.log("\n=== 3. Gọi tool get_test_case_detail cho TC-07 ===");
const detailResult = await client.callTool({
  name: "get_test_case_detail",
  arguments: { testCaseId: "TC-07" },
});
console.log(detailResult.content[0].text);

await client.close();
