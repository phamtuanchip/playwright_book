# Chương 16: Fixtures cơ bản, tái sử dụng logic test

## Mục tiêu học

- Hiểu fixture là gì, khác gì với hook (`beforeEach`) đã học ở Chương 12.
- Viết được một custom fixture đơn giản, có cả phần setup và teardown.
- Biết khi nào dùng fixture, khi nào dùng hook/Page Object đã đủ.

> Code mẫu: `code/playwright-tests/fixtures.ts` (fixture `loggedInPage`) +
> `tests/ch16-fixtures-co-ban.spec.ts`.

## 16.1. Fixture khác hook như thế nào?

Chương 12 dùng `test.beforeEach` để đăng nhập trước mỗi test — **mọi** test trong `describe` đó đều
phải đăng nhập, dù có cần hay không. **Fixture** giải quyết khác: mỗi test **tự khai báo** fixture
nào nó cần (qua tên tham số), và Playwright chỉ chạy đúng phần setup của fixture đó — test không
khai báo thì không tốn chi phí chạy fixture.

```ts
// Trước (Chương 12): MỌI test trong describe đều bị đăng nhập, dù cần hay không
test.describe("...", () => {
  test.beforeEach(async ({ page }) => { /* đăng nhập... */ });
  test("test A", async ({ page }) => { /* ... */ });
  test("test B", async ({ page }) => { /* ... */ });
});

// Sau (Chương 16): test nào cần đăng nhập thì khai báo `loggedInPage`, test nào không cần thì không
test("test A cần đăng nhập", async ({ loggedInPage }) => { /* ... */ });
test("test B không cần đăng nhập", async ({ page }) => { /* ... */ });
```

## 16.2. Viết một custom fixture

```ts
// fixtures.ts
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

type Fixtures = {
  loggedInPage: import("@playwright/test").Page;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page, request }, use) => {
    await request.post("/api/test/reset");          // --- setup ---
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("demo@example.com", "Password123!");

    await use(page);                                 // --- test chạy ở đây ---

    await request.post("/api/test/reset");          // --- teardown ---
  },
});

export { expect };
```

Ba điểm quan trọng:

1. `base.extend<Fixtures>({...})` tạo ra **một `test` mới**, có thêm fixture `loggedInPage`, bên
   cạnh các fixture gốc của Playwright (`page`, `request`, `context`...) — vẫn dùng được như cũ.
2. **Mọi thứ trước `await use(page)`** là phần setup — chạy trước khi test bắt đầu.
3. **Mọi thứ sau `await use(page)`** là phần teardown — chạy sau khi test kết thúc (Playwright đảm
   bảo chạy dù test pass hay fail), tương tự vai trò của `afterEach`.

Trong toàn bộ project, phải **import `test`/`expect` từ `./fixtures`** (không phải trực tiếp từ
`@playwright/test`) để có được fixture `loggedInPage`:

```ts
import { test, expect } from "../fixtures"; // KHÔNG phải "@playwright/test"
```

## 16.3. So sánh với Page Object Model (Chương 15)

Fixture và Page Object **giải quyết hai vấn đề khác nhau, dùng chung với nhau tốt**:

| | Page Object (Chương 15) | Fixture (Chương 16) |
|---|---|---|
| Giải quyết | Gói locator/action của MỘT TRANG | Tái sử dụng logic SETUP/TEARDOWN cho MỖI TEST |
| Test vẫn phải gọi | `await loginPage.login(...)` tường minh trong từng test | Không cần gọi gì — chỉ cần khai báo tham số `loggedInPage` |
| Ví dụ trong sách | `pages/LoginPage.ts` | `fixtures.ts` — bên trong vẫn **dùng** `LoginPage` để login |

Nhìn vào `fixtures.ts`: nó dùng chính `LoginPage` (Chương 15) bên trong phần setup — hai kỹ thuật
không thay thế nhau, mà **xếp lớp lên nhau**: Page Object gói locator, fixture gói khi-nào-chạy
phần setup đó.

## 16.4. Test không cần fixture vẫn dùng `page` như thường

```ts
test("trang login hiển thị đúng tiêu đề (không cần fixture đăng nhập)", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});
```

Vì `base.extend()` chỉ **thêm** fixture mới, không xoá fixture gốc — `page`, `request`, `context`
vẫn dùng được nguyên vẹn trong file đã import `test` từ `../fixtures`.

## Bài tập

1. Chạy `npm test`, xác nhận toàn bộ 31 test pass.
2. Thêm một `console.log` vào ngay trước và ngay sau `await use(page)` trong `fixtures.ts`, chạy
   riêng `ch16-fixtures-co-ban.spec.ts` — quan sát thứ tự log để xác nhận đúng 3 test, phần setup
   chạy đúng 3 lần (một lần cho 2 test dùng `loggedInPage`, không chạy cho test thứ 3).
3. Viết thêm một fixture `profilePage` trong `fixtures.ts`, trả về một `ProfilePage` instance đã ở
   sẵn trang `/profile` (gợi ý: fixture này có thể **phụ thuộc vào** `loggedInPage` — khai báo nó
   trong object tham số đầu của hàm fixture).
4. Refactor `ch12-cau-truc-test.spec.ts` (giữ nguyên hành vi) để dùng fixture `loggedInPage` thay
   cho `test.beforeEach` — so sánh độ dài code trước/sau.

## Lỗi thường gặp

- **Import `test` từ `@playwright/test` thay vì từ `./fixtures`**: fixture tuỳ biến (`loggedInPage`)
  sẽ không tồn tại, TypeScript báo lỗi ngay khi cố khai báo tham số đó.
- **Quên `await use(page)`**: test sẽ không bao giờ chạy — hàm fixture "treo" ở bước setup mãi mãi.
- **Đặt phần teardown TRƯỚC `use()` thay vì sau**: teardown chạy trước khi test kịp thực thi, không
  có ý nghĩa gì — luôn nhớ thứ tự: setup → `use()` → teardown.
- **Dùng fixture cho logic chỉ 1 test cần**: nếu chỉ một test cần một đoạn setup riêng biệt, viết
  trực tiếp trong test đó rõ ràng hơn là tạo fixture mới cho riêng nó.

## Tóm tắt & tiếp theo

- Fixture cho phép mỗi test tự khai báo phụ thuộc (dependency) nó cần, tránh chạy setup thừa cho
  test không cần.
- Cấu trúc `setup → await use(...) → teardown` là khuôn mẫu chung của mọi custom fixture.
- Fixture và Page Object bổ trợ nhau: Page Object gói locator/action, fixture gói vòng đời
  setup/teardown.

Chương 17 chuyển sang kỹ năng debug: Trace Viewer, UI Mode, và cách đọc lỗi khi một trong 31 test
hiện có bất ngờ fail.
