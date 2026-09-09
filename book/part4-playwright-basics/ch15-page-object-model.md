# Chương 15: Page Object Model (POM) — tổ chức code test dễ bảo trì

## Mục tiêu học

- Hiểu vấn đề Page Object Model giải quyết, và khi nào nên bắt đầu dùng nó.
- Viết được một Page Object hoàn chỉnh, gói locator + action vào một class.
- So sánh trực tiếp code test trước/sau khi áp dụng POM.

> Code mẫu: `code/playwright-tests/pages/LoginPage.ts`, `pages/ProfilePage.ts` +
> `tests/ch15-page-object-model.spec.ts` — viết lại một phần test Chương 11 bằng POM.

## 15.1. Vấn đề: locator lặp lại khắp nơi

Mở lại `ch11-login-test-cases.spec.ts` — dòng `page.getByLabel("Email").fill(...)` xuất hiện trong
**9 trên 10 test**. Nếu demo app đổi label "Email" thành "Địa chỉ email", phải sửa ở toàn bộ 9 chỗ.
Đây chính xác là "Vấn đề 4" đã học ở Chương 6 (lặp lại logic), nhưng ở quy mô lớn hơn nhiều khi
project có hàng chục, hàng trăm test.

**Page Object Model (POM)** giải quyết vấn đề này: gom toàn bộ locator + action của **một trang**
vào **một class**, test chỉ gọi phương thức của class đó, không biết (và không cần biết) chi tiết
locator bên trong.

## 15.2. Viết một Page Object

```ts
// pages/LoginPage.ts
import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Mật khẩu").fill(password);
    await this.page.getByRole("button", { name: "Đăng nhập" }).click();
  }

  get serverError() {
    return this.page.locator("#server-error");
  }
}
```

Ba nguyên tắc khi viết Page Object:

1. **Constructor nhận `page`**, lưu lại để dùng trong các phương thức khác.
2. **Action phức hợp** (như `login()` — gồm 2 lần fill + 1 click) trở thành **một phương thức duy
   nhất**, đặt tên theo *ý định* ("login"), không phải theo *thao tác* ("fillAndClick").
3. **Locator hay dùng để assert** (như `serverError`) expose qua **getter**, để test gọi
   `loginPage.serverError` như một thuộc tính, gọn hơn gọi lại `page.locator("#server-error")`.

## 15.3. So sánh trực tiếp: trước và sau

**Trước (Chương 11, không có POM):**

```ts
test("TC-02: đăng nhập thất bại với sai mật khẩu", async ({ page }) => {
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mật khẩu").fill("SaiRoi123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
});
```

**Sau (Chương 15, dùng `LoginPage`):**

```ts
test("TC-02 (viết lại bằng POM): sai mật khẩu hiển thị lỗi", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("demo@example.com", "SaiRoi123");

  await expect(loginPage.serverError).toHaveText("Email hoặc mật khẩu không đúng");
});
```

Test ngắn hơn, đọc gần như mô tả bằng lời ("vào trang login, đăng nhập sai, kiểm tra thông báo
lỗi"), và **không còn biết** form dùng `getByLabel` hay cấu trúc DOM nào — chi tiết đó chỉ nằm
trong `LoginPage.ts`.

## 15.4. Kết hợp nhiều Page Object trong một test

```ts
test("kết hợp 2 Page Object: đăng nhập rồi cập nhật hồ sơ", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);

  await loginPage.goto();
  await loginPage.login("demo@example.com", "Password123!");

  await profilePage.goto();
  await profilePage.fillDisplayName("Trần Văn A (qua POM)");
  await profilePage.save();

  await expect(profilePage.serverSuccess).toHaveText("Đã lưu hồ sơ.");
});
```

Mỗi trang một Page Object riêng — test luồng đi qua nhiều trang chỉ cần khởi tạo nhiều instance và
gọi phương thức tương ứng, không lẫn lộn locator giữa các trang.

## 15.5. Khi nào NÊN dùng POM, khi nào chưa cần?

POM có chi phí: thêm một lớp trừu tượng, thêm file phải bảo trì. Với 1-2 test đơn giản (như
`ch08-smoke.spec.ts`), viết trực tiếp vẫn rõ ràng hơn. POM đáng giá khi:

- Cùng một trang được test bởi **nhiều test khác nhau** (như trang login — 10+ test qua các
  chương).
- Nhóm làm việc **từ 2 người trở lên**, cần một "hợp đồng" rõ ràng giữa locator và logic test.
- Ứng dụng đang test có khả năng **thay đổi UI thường xuyên** — POM giới hạn phạm vi phải sửa khi
  UI đổi.

## Bài tập

1. Chạy `npm test`, xác nhận toàn bộ 28 test pass.
2. Viết thêm phương thức `loginWithEnter` (đã có sẵn trong `LoginPage.ts` nhưng chưa được test nào
   gọi tới) — dùng nó viết lại test TC-09 (Chương 11) theo phong cách POM.
3. Trong `pages/ProfilePage.ts`, thêm getter `bioTextarea` trả về locator của trường "Giới thiệu",
   viết một test mới xác nhận giá trị textarea sau khi `fillBio()`.
4. Thử đổi label "Mật khẩu" trong `code/demo-app/src/views.js` thành "Mật khẩu đăng nhập", chạy lại
   `npm test` — đếm xem có bao nhiêu chỗ trong `pages/LoginPage.ts` cần sửa, so với số chỗ sẽ phải
   sửa nếu **không** dùng POM (đếm trong `ch11-login-test-cases.spec.ts`). Đổi lại label như cũ sau
   khi thử xong.

## Lỗi thường gặp

- **Nhét cả assertion vào bên trong Page Object**: Page Object nên chỉ chứa locator + action, để
  **test** tự quyết định assert gì — nhét sẵn `expect()` vào Page Object làm giảm tính linh hoạt
  khi các test khác nhau cần kiểm tra những điều khác nhau.
- **Tạo Page Object cho từng trang dù chỉ có 1 test dùng tới**: chi phí bảo trì không đáng so với
  lợi ích — xem mục 15.5.
- **Page Object gọi lẫn vào Page Object khác**: giữ mỗi Page Object độc lập, để test (không phải
  Page Object) là nơi điều phối luồng qua nhiều trang (như ví dụ mục 15.4).

## Tóm tắt & tiếp theo

- Page Object Model gom locator + action của một trang vào một class, giải quyết vấn đề lặp lại
  locator ở nhiều test.
- Không phải lúc nào cũng cần POM — đáng giá nhất khi nhiều test dùng chung một trang, hoặc làm
  việc nhóm.
- Page Object chỉ nên chứa locator/action, không chứa assertion.

Chương 16 học fixtures — một cơ chế khác của Playwright để tái sử dụng logic setup (như "đăng nhập
sẵn" đã lặp lại ở nhiều `beforeEach` từ Chương 12 tới giờ), tinh gọn hơn nữa so với gọi tay
`loginPage.login()` trong mỗi `beforeEach`.
