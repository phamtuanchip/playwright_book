import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { z } from "zod";

// MCP server tối giản (Chương 27) — expose MỘT tool duy nhất, đọc chính bộ test case
// đăng nhập ở Chương 1 (code/ch01-sdlc/test-case-list-login.md) và trả về vài con số về nó.
// Chạy qua STDIO — giống hầu hết MCP server thật (kể cả Playwright MCP server, Chương 28).

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new McpServer({ name: "book-demo-mcp-server", version: "1.0.0" });

server.registerTool(
  "count_login_test_cases",
  {
    title: "Đếm test case đăng nhập",
    description:
      "Đếm số test case (TC-xx) và số test case đã được tự động hoá bằng Playwright, dựa trên bộ test case đăng nhập ở Chương 1 của sách.",
    inputSchema: {},
  },
  async () => {
    const filePath = path.join(__dirname, "..", "ch01-sdlc", "test-case-list-login.md");
    const content = readFileSync(filePath, "utf8");
    const testCaseIds = content.match(/\bTC-\d+\b/g) || [];
    const uniqueIds = [...new Set(testCaseIds)];

    return {
      content: [
        {
          type: "text",
          text: `Bộ test case đăng nhập (Chương 1) có ${uniqueIds.length} test case: ${uniqueIds.join(", ")}.`,
        },
      ],
    };
  }
);

server.registerTool(
  "get_test_case_detail",
  {
    title: "Xem chi tiết một test case",
    description: "Trả về dòng mô tả đầy đủ của một test case theo ID (ví dụ TC-07).",
    inputSchema: { testCaseId: z.string().describe("ID test case, ví dụ TC-07") },
  },
  async ({ testCaseId }) => {
    const filePath = path.join(__dirname, "..", "ch01-sdlc", "test-case-list-login.md");
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const line = lines.find((l) => l.startsWith(`| ${testCaseId} `));

    return {
      content: [
        {
          type: "text",
          text: line ? line : `Không tìm thấy test case ${testCaseId}.`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
