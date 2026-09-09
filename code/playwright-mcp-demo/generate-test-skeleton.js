import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync } from "fs";

// Heuristic đơn giản (KHÔNG gọi LLM thật) — quét accessibility snapshot (Chương 28), tìm các
// phần tử có thể thao tác (textbox/button/checkbox/combobox) theo role + accessible name,
// sinh sẵn một KHUNG test Playwright. Đây là đúng NGUYÊN LÝ mà công cụ sinh test bằng AI
// thật cũng dùng bên dưới — khác biệt là AI thật "hiểu" ngữ cảnh (biết nên điền giá trị gì
// vào field nào, nên assert gì), còn heuristic ở đây chỉ liệt kê phần tử tìm được, con người
// vẫn phải điền giá trị/assertion — xem Chương 29 để hiểu rõ ranh giới này.

const transport = new StdioClientTransport({ command: "npx", args: ["@playwright/mcp", "--headless"] });
const client = new Client({ name: "test-generator", version: "1.0.0" });
await client.connect(transport);

const targetUrl = process.argv[2] || "http://localhost:3000/login";
await client.callTool({ name: "browser_navigate", arguments: { url: targetUrl } });
const snapshotResult = await client.callTool({ name: "browser_snapshot", arguments: {} });
const snapshotText = snapshotResult.content.map((c) => c.text).join("\n");

const elementPattern = /(textbox|button|checkbox|combobox)\s+"([^"]+)"/g;
const found = [];
let match;
while ((match = elementPattern.exec(snapshotText))) {
  found.push({ role: match[1], name: match[2] });
}

const lines = [
  `import { test, expect } from "@playwright/test";`,
  ``,
  `// Khung test được SINH TỰ ĐỘNG từ accessibility snapshot của ${targetUrl}`,
  `// (heuristic, xem generate-test-skeleton.js — Chương 29). Đây là bản DRAFT — cần người`,
  `// review, điền giá trị cụ thể và assertion trước khi dùng thật.`,
  `test("khung test tự sinh cho ${targetUrl}", async ({ page }) => {`,
  `  await page.goto("${targetUrl}");`,
  ``,
];
for (const el of found) {
  if (el.role === "textbox") {
    lines.push(`  await page.getByRole("textbox", { name: "${el.name}" }).fill("TODO: điền giá trị");`);
  } else if (el.role === "button") {
    lines.push(`  // await page.getByRole("button", { name: "${el.name}" }).click();`);
  } else {
    lines.push(`  // TODO: thao tác với ${el.role} "${el.name}"`);
  }
}
lines.push(``, `  // TODO: thêm assertion kiểm tra kết quả mong đợi`, `});`, ``);

const output = lines.join("\n");
console.log(output);
writeFileSync("generated-test-skeleton.spec.ts", output);
console.log("\n(Đã lưu vào generated-test-skeleton.spec.ts)");

await client.close();
