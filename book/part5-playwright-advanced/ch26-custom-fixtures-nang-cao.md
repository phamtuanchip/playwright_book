# Chương 26: Custom fixtures nâng cao, viết plugin/reporter riêng

## Mục tiêu học

- Viết fixture **worker-scoped** — chạy một lần cho cả worker, khác fixture test-scoped (Chương 16)
  chạy lại cho mỗi test.
- Kết hợp fixture worker-scoped với kỹ thuật "mỗi worker một tài khoản riêng" (Chương 23).
- Viết một custom reporter đơn giản, không cần cài package ngoài.

> Code mẫu: `fixtures.ts` (fixture `workerAccount`, `isolatedLoggedInPage`) +
> `tests/ch26-custom-fixtures-nang-cao.spec.ts` + `tools/simple-reporter.js`.

## 26.1. Fixture worker-scoped — chạy một lần cho cả worker

Mọi fixture ở Chương 16 (`loggedInPage`) là **test-scoped**: chạy lại từ đầu cho **mỗi** test.
Với việc tạo tài khoản (Chương 23) — vốn không cần tạo lại nếu đã có — chạy lại mỗi test là lãng
phí. **Fixture worker-scoped** giải quyết đúng việc này: chạy **một lần cho cả worker**, mọi test
trong worker đó dùng lại cùng kết quả.

```ts
// fixtures.ts
type WorkerFixtures = {
  workerAccount: { email: string; password: string };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ...
  workerAccount: [
    async ({}, use, workerInfo) => {
      const email = `worker-account-${workerInfo.workerIndex}@example.com`;
      const password = "Password123!";

      // Fixture worker-scoped KHÔNG dùng được fixture `request` (test-scoped) — phải tự
      // tạo APIRequestContext riêng, giống global-setup.ts (Chương 22).
      const requestContext = await playwrightRequest.newContext({ baseURL: "http://localhost:3000" });
      await requestContext.post("/api/test/create-user", { data: { email, password } });
      await requestContext.dispose();

      await use({ email, password }); // chạy 1 lần, dùng lại cho MỌI test trong worker
    },
    { scope: "worker" }, // ← khai báo scope, khác mặc định (test-scoped)
  ],
});
```

Ba điểm khác biệt so với fixture test-scoped (Chương 16):

1. **Khai báo dạng tuple** `[hàm, { scope: "worker" }]`, không phải hàm trực tiếp.
2. **Không truy cập được fixture test-scoped** (`page`, `request`) — chỉ dùng fixture worker-scoped
   khác, hoặc tạo tài nguyên độc lập (như `playwrightRequest.newContext()` ở trên).
3. Tham số thứ ba của hàm fixture là **`workerInfo`** (khác `testInfo` của fixture test-scoped) —
   chứa `workerIndex`, ổn định trong suốt vòng đời worker đó.

## 26.2. Kết hợp fixture worker-scoped với fixture test-scoped

```ts
isolatedLoggedInPage: async ({ page, workerAccount }, use) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(workerAccount.email, workerAccount.password);
  await use(page);
},
```

`isolatedLoggedInPage` (test-scoped) **phụ thuộc vào** `workerAccount` (worker-scoped) — Playwright
tự hiểu và chỉ tạo `workerAccount` một lần, tái sử dụng cho mọi test gọi `isolatedLoggedInPage`
trong cùng worker. Đây chính là cách kết hợp: **setup đắt đỏ, không đổi giữa các test** → worker
scope; **setup rẻ, cần làm lại mỗi test** (đăng nhập lại, vì mỗi test có `page`/browser context
riêng — nhắc lại Chương 12) → test scope.

Kiểm chứng thật:

```bash
npx playwright test ch26-custom-fixtures-nang-cao --workers=3
```

```
[SimpleReporter] Bắt đầu chạy 3 test...
[SimpleReporter] ✓ test #0: ... (231ms)
[SimpleReporter] ✓ test #1: ... (235ms)
[SimpleReporter] ✓ test #2: ... (226ms)
[SimpleReporter] Xong: passed — chạy trong 2.1s
```

## 26.3. Viết custom reporter

Một custom reporter chỉ cần là **một class** với (một phần) các phương thức Playwright gọi tới ở
từng giai đoạn — không cần cài package, không cần `extends` class nào:

```js
// tools/simple-reporter.js
class SimpleReporter {
  onBegin(config, suite) {
    this.startTime = Date.now();
    this.total = suite.allTests().length;
    console.log(`\n[SimpleReporter] Bắt đầu chạy ${this.total} test...`);
  }

  onTestEnd(test, result) {
    const icon = result.status === "passed" ? "✓" : result.status === "skipped" ? "○" : "✗";
    console.log(`[SimpleReporter] ${icon} ${test.title} (${result.duration}ms)`);
  }

  onEnd(result) {
    const seconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[SimpleReporter] Xong: ${result.status} — chạy trong ${seconds}s\n`);
  }
}

module.exports = SimpleReporter;
```

Đăng ký trong `playwright.config.ts`, cùng với `html` và `allure-playwright` (Chương 18):

```ts
reporter: [["html"], ["allure-playwright"], ["./tools/simple-reporter.js"]],
```

Ba phương thức phổ biến nhất (còn nhiều phương thức khác như `onStdOut`, `onError`):

| Phương thức | Gọi khi nào |
|---|---|
| `onBegin(config, suite)` | Một lần, trước khi test đầu tiên chạy — biết trước tổng số test |
| `onTestEnd(test, result)` | Sau **mỗi** test — biết pass/fail/skip và thời gian chạy |
| `onEnd(result)` | Một lần, sau khi toàn bộ test run xong |

## 26.4. Khi nào viết custom reporter, khi nào dùng có sẵn?

Với nhu cầu thông thường, `html` (Chương 9) và `allure-playwright` (Chương 18) đã đủ. Viết
reporter riêng đáng làm khi cần: gửi kết quả tới hệ thống nội bộ (Slack, dashboard riêng của công
ty), định dạng output đặc thù cho công cụ khác đọc, hoặc log gọn hơn cho terminal khi chạy dev
hàng ngày (như `SimpleReporter` ở đây).

## Bài tập

1. Chạy `npx playwright test ch26-custom-fixtures-nang-cao --workers=3`, xác nhận log của
   `SimpleReporter` hiện đúng 3 dòng `✓`.
2. Thêm phương thức `onStdOut` vào `SimpleReporter`, in ra mọi `console.log` từ code test/app —
   thử thêm một `console.log` tạm trong `demo-app/server.js` để quan sát.
3. Đổi `{ scope: "worker" }` thành bỏ hẳn (về test-scoped mặc định) trong `workerAccount`, chạy
   lại `npx playwright test ch26-custom-fixtures-nang-cao --workers=3` — dùng `console.log`
   trong fixture để đếm số lần `POST /api/test/create-user` được gọi, so sánh trước/sau.
4. Viết thêm phương thức `onError` vào `SimpleReporter`, in ra một dòng riêng khi có lỗi ở cấp độ
   framework (không phải lỗi test thường) xảy ra.

## Lỗi thường gặp

- **Cố truy cập fixture test-scoped (`page`, `request`) từ fixture worker-scoped**: Playwright báo
  lỗi ngay khi khai báo — fixture worker-scoped chỉ phụ thuộc được fixture worker-scoped khác.
- **Dùng worker-scoped cho dữ liệu CẦN sạch ở mỗi test**: nếu test làm thay đổi trạng thái (như
  TC-07 khoá tài khoản), dùng chung 1 tài khoản worker-scoped cho mọi test sẽ gây đúng vấn đề đã
  gặp ở Chương 11 — chỉ dùng worker scope cho setup **không đổi** giữa các test.
- **Quên `module.exports`** trong file reporter tuỳ biến: Playwright không nhận diện được class,
  báo lỗi khi load config.

## Tóm tắt & tiếp theo

- Fixture worker-scoped chạy một lần cho cả worker — phù hợp cho setup đắt đỏ, không đổi giữa các
  test (như tạo tài khoản).
- Custom reporter chỉ cần một class với các phương thức `onBegin`/`onTestEnd`/`onEnd` — không cần
  cài gì thêm.
- Kết hợp fixture worker-scoped + test-scoped cho phép tối ưu tốc độ mà vẫn giữ mỗi test độc lập.

Phần V (Playwright nâng cao) đến đây đã hoàn thành — 26 chương, 55 test, một demo app đầy đủ, một
project component testing riêng, và một pipeline CI. Phần VI chuyển hướng hoàn toàn: AI + MCP —
dùng AI để điều khiển trình duyệt và hỗ trợ viết test.
