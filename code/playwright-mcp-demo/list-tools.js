import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Kết nối tới Playwright MCP server chính thức (@playwright/mcp) và liệt kê TOÀN BỘ tool
// nó expose — không cần đọc tài liệu, tự "khám phá" được ngay từ MCP server thật.

const transport = new StdioClientTransport({
  command: "npx",
  args: ["@playwright/mcp", "--headless"],
});

const client = new Client({ name: "book-demo-explorer", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
for (const t of tools) {
  console.log(`${t.name} - ${t.description}`);
}

await client.close();
