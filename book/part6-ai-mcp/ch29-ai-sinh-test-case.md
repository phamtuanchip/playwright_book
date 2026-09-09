# Chương 29: Kết hợp AI sinh test case, self-healing test khi UI thay đổi

## Mục tiêu học

- Hiểu cơ chế bên dưới việc AI hỗ trợ sinh test case — không phải "ma thuật", mà dựa trên
  accessibility snapshot (Chương 28).
- Tự viết một công cụ sinh khung test bằng heuristic, thấy rõ ranh giới giữa heuristic và AI thật.
- Viết và kiểm chứng thật kỹ thuật self-healing locator — tự phục hồi khi một chiến lược locator
  không còn đúng.

> Code mẫu: `code/playwright-tests/utils/resilient-locate.ts` +
> `tests/ch29-self-healing.spec.ts` (self-healing, đã kiểm chứng 3/3 pass) và
> `code/playwright-mcp-demo/generate-test-skeleton.js` (sinh test từ snapshot, đã chạy thật).

## 29.1. AI sinh test case — cơ chế bên dưới là gì?

Các công cụ "AI sinh test case" (nhiều công cụ thương mại quảng cáo tính năng này) về bản chất làm
2 việc: (1) **quan sát** trang web — qua accessibility snapshot, giống `browser_snapshot` đã học ở
Chương 28 — để biết trang có những phần tử nào, và (2) **suy luận** bằng LLM để quyết định nên
điền giá trị gì, click gì, assert gì, dựa trên ngữ cảnh (tên field, nội dung trang...).

Chương này **không gọi LLM thật** (ngoài phạm vi một chương của sách, cần API key và chi phí riêng)
— nhưng tách riêng được **phần (1)**, hoàn toàn có thể tự làm bằng code thường (heuristic), để
thấy rõ phần nào là "cơ chế lấy dữ liệu" và phần nào mới thực sự cần AI.

## 29.2. Tự viết một công cụ sinh khung test bằng heuristic

```js
// code/playwright-mcp-demo/generate-test-skeleton.js
const elementPattern = /(textbox|button|checkbox|combobox)\s+"([^"]+)"/g;
// ... quét accessibility snapshot, tìm mọi phần tử thao tác được theo role + tên ...
```

Chạy thật trên trang `/login`:

```bash
cd code/playwright-mcp-demo
npm run generate -- http://localhost:3000/login
```

Kết quả thật (đã lưu ở `example-generated-login.spec.ts`):

```ts
import { test, expect } from "@playwright/test";

test("khung test tự sinh cho http://localhost:3000/login", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.getByRole("textbox", { name: "Email" }).fill("TODO: điền giá trị");
  await page.getByRole("textbox", { name: "Mật khẩu" }).fill("TODO: điền giá trị");
  // await page.getByRole("button", { name: "Hiện ký tự" }).click();
  // await page.getByRole("button", { name: "Đăng nhập" }).click();

  // TODO: thêm assertion kiểm tra kết quả mong đợi
});
```

**Đây chính xác là phần (1)** ở mục 29.1 — tự động tìm ra "trang này có field Email, Mật khẩu, nút
Hiện ký tự, nút Đăng nhập". **Phần (2) — AI thật sẽ làm tiếp:** biết "Email" nên điền
`demo@example.com` (không phải chuỗi ngẫu nhiên), biết nên click "Đăng nhập" sau khi điền xong (bỏ
comment dòng đó), và biết nên assert `toHaveURL("/dashboard")` dựa trên hiểu ngữ cảnh nghiệp vụ
"đăng nhập" — những việc heuristic thuần **không** làm được.

**Bài học quan trọng nhất của mục này:** dù dùng công cụ AI sinh test case thật, kết quả sinh ra
vẫn cần được **review kỹ** — đúng tinh thần đã học ở Chương 17 với `codegen`: điểm khởi đầu tốt,
không phải sản phẩm cuối.

## 29.3. Self-healing locator — không cần AI

**Self-healing test** là kỹ thuật giúp test **tự phục hồi** khi UI thay đổi nhẹ, không cần con
người sửa code test ngay. Nhiều công cụ thương mại quảng cáo "self-healing bằng AI", nhưng nguyên
lý cốt lõi — thử nhiều chiến lược locator theo thứ tự ưu tiên — **không cần AI**:

```ts
// utils/resilient-locate.ts
export async function resilientLocate(page, strategies, timeoutMs = 2000) {
  for (const strategy of strategies) {
    const locator = strategy.locate();
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      return { locator, strategyUsed: strategy.name };
    } catch {
      continue; // chiến lược này không tìm được — thử chiến lược tiếp theo
    }
  }
  throw new Error(`resilientLocate: không chiến lược nào tìm được phần tử`);
}
```

Kiểm chứng thật — giả lập tình huống "dev đổi ID input email":

```ts
const { locator: emailInput, strategyUsed } = await resilientLocate(page, [
  { name: "css cũ (#email-old) — giả lập ID đã đổi", locate: () => page.locator("#email-old") },
  { name: "getByLabel Email — chiến lược dự phòng", locate: () => page.getByLabel("Email") },
]);

expect(strategyUsed).toBe("getByLabel Email — chiến lược dự phòng");
```

Chiến lược đầu (`#email-old`) cố tình sai (mô phỏng UI đã đổi) — `resilientLocate` tự chuyển sang
`getByLabel("Email")` (chiến lược dựa trên role/label, ổn định hơn — nhắc lại Chương 11) mà
**không cần sửa code test nào**. Đã kiểm chứng: 3/3 test pass, gồm cả trường hợp không chiến lược
nào đúng — báo lỗi rõ ràng thay vì treo im lặng.

## 29.4. Ranh giới giữa self-healing "thật" (AI) và kỹ thuật ở mục 29.3

`resilientLocate` chỉ hoạt động khi **bạn đã lường trước** các chiến lược dự phòng hợp lý (viết
sẵn trong code). Self-healing dựa trên AI thật đi xa hơn: khi TẤT CẢ chiến lược viết sẵn đều thất
bại, AI có thể **tự phân tích accessibility snapshot mới**, suy luận phần tử nào "giống" phần tử
cũ nhất (dựa trên vị trí, text xung quanh, vai trò...) mà không cần con người viết trước chiến
lược dự phòng cụ thể đó. Đây là điểm khác biệt cốt lõi — không phải "có AI hay không" một cách mơ
hồ, mà là "cần con người lường trước tình huống, hay để hệ thống tự suy luận tình huống mới".

## Bài tập

1. Chạy `cd code/playwright-tests && npm test -- ch29-self-healing`, xác nhận 3/3 pass.
2. Chạy `cd code/playwright-mcp-demo && npm run generate -- http://localhost:3000/profile` (yêu
   cầu demo-app đang chạy) — so sánh khung test sinh ra với `pages/ProfilePage.ts` (Chương 15) đã
   viết tay, thiếu những gì so với phiên bản hoàn chỉnh?
3. Thêm một chiến lược thứ ba vào bài test self-healing — dùng `getByPlaceholder` hoặc
   `getByTestId` (giả định demo-app có `data-testid`) làm chiến lược dự phòng thứ hai, trước
   `getByLabel`.
4. Viết ra (không cần code) một tình huống mà `resilientLocate` **không** đủ để xử lý — tình huống
   đó cần loại "self-healing" nào (dựa AI thật) để giải quyết?

## Lỗi thường gặp

- **Tin tưởng tuyệt đối vào công cụ "AI sinh test case", không review**: kết quả sinh ra (dù bằng
  heuristic hay AI thật) đều cần con người kiểm tra lại giá trị điền, assertion — đây là nguyên
  tắc xuyên suốt từ Chương 17 (`codegen`).
- **Nhầm self-healing với "test không bao giờ fail"**: self-healing chỉ xử lý được tình huống đã
  lường trước (chiến lược dự phòng có sẵn) — nó không biến một test sai logic thành đúng.
- **Viết quá nhiều chiến lược dự phòng "phòng hờ"**: mỗi chiến lược thêm là thêm một khả năng che
  giấu lỗi thật (test "tự sửa" qua một chiến lược không phù hợp, dẫn tới test không còn kiểm tra
  đúng ý định ban đầu) — chỉ thêm chiến lược dự phòng có cơ sở thực tế.

## Tóm tắt & tiếp theo

- AI sinh test case = quan sát (accessibility snapshot, đã tự làm được bằng heuristic) + suy luận
  (cần AI thật) — tách được hai phần này giúp hiểu rõ AI thực sự đóng góp gì.
- Self-healing locator (thử nhiều chiến lược theo thứ tự) không cần AI, hoạt động tốt cho tình
  huống đã lường trước — đã kiểm chứng thật với 3/3 test pass.
- Self-healing dựa trên AI thật xử lý được tình huống MỚI, chưa từng lường trước — khác biệt cốt
  lõi với kỹ thuật ở chương này.

Chương 30 — chương cuối cùng của sách — tổng hợp toàn bộ kiến thức qua một case study thực tế: xây
dựng một pipeline test bán tự động kết hợp Playwright, CI/CD, và AI/MCP.
