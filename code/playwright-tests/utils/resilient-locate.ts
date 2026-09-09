import { Locator, Page } from "@playwright/test";

export type LocatorStrategy = { name: string; locate: () => Locator };

// "Self-healing" ở mức đơn giản, KHÔNG dùng AI (xem Chương 29 để phân biệt với self-healing
// dựa trên AI thật): thử nhiều chiến lược locator theo thứ tự ưu tiên, dùng chiến lược ĐẦU
// TIÊN tìm thấy phần tử. Nếu chiến lược ưu tiên cao nhất (thường gắn với cấu trúc DOM cụ
// thể, dễ vỡ khi UI đổi) không còn tìm được phần tử, tự "chữa lành" bằng chiến lược dự
// phòng (thường theo role/label, ổn định hơn — nhắc lại Chương 11) mà KHÔNG cần sửa code test.
export async function resilientLocate(
  page: Page,
  strategies: LocatorStrategy[],
  timeoutMs = 2000
): Promise<{ locator: Locator; strategyUsed: string }> {
  for (const strategy of strategies) {
    const locator = strategy.locate();
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      return { locator, strategyUsed: strategy.name };
    } catch {
      continue; // chiến lược này không tìm được phần tử trong thời gian cho phép — thử tiếp
    }
  }
  throw new Error(
    `resilientLocate: không chiến lược nào tìm được phần tử (đã thử: ${strategies
      .map((s) => s.name)
      .join(", ")})`
  );
}
